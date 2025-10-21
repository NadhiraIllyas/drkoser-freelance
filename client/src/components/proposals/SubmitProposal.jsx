import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SubmitProposal = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    bidAmount: '',
    estimatedTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (user?.role !== 'freelancer') {
      setError('Only freelancers can submit proposals');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/proposals', {
        jobId: job._id,
        coverLetter: formData.coverLetter,
        bidAmount: parseFloat(formData.bidAmount),
        estimatedTime: formData.estimatedTime
      });

      alert('Proposal submitted successfully!');
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting proposal');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p>Only freelancers can submit proposals.</p>
          <button onClick={onClose} className="btn-primary mt-4 w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Submit Proposal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Job: {job.title}</h3>
          <p className="text-sm text-gray-600">Budget: ${job.budget}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter *
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows="6"
              required
              className="input-field"
              placeholder="Explain why you're the best fit for this job. Include your relevant experience and how you plan to approach the project..."
              value={formData.coverLetter}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.coverLetter.length}/2000 characters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid ($) *
              </label>
              <input
                type="number"
                id="bidAmount"
                name="bidAmount"
                required
                min="1"
                max={job.budget * 2}
                className="input-field"
                placeholder="Enter your bid amount"
                value={formData.bidAmount}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                Job budget: ${job.budget}
              </p>
            </div>

            <div>
              <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time *
              </label>
              <select
                id="estimatedTime"
                name="estimatedTime"
                required
                className="input-field"
                value={formData.estimatedTime}
                onChange={handleChange}
              >
                <option value="">Select timeframe</option>
                <option value="Less than 1 week">Less than 1 week</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-2 months">1-2 months</option>
                <option value="2+ months">2+ months</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposal;