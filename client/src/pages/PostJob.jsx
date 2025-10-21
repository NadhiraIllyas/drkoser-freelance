import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web-development',
    budget: '',
    deadline: '',
    skillsRequired: ''
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

    if (user?.role !== 'client') {
      setError('Only clients can post jobs');
      setLoading(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        budget: parseInt(formData.budget),
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim())
      };

      await api.post('/jobs', jobData);
      navigate('/jobs');
    } catch (error) {
      setError(error.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'client') {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p>Only clients can post jobs. Please create a client account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="input-field mt-1"
            placeholder="e.g., React Developer Needed for E-commerce Site"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="6"
            required
            className="input-field mt-1"
            placeholder="Describe the project, requirements, and deliverables..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              className="input-field mt-1"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="graphic-design">Graphic Design</option>
              <option value="content-writing">Content Writing</option>
              <option value="digital-marketing">Digital Marketing</option>
              <option value="seo">SEO</option>
              <option value="data-entry">Data Entry</option>
              <option value="customer-service">Customer Service</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Budget ($) *
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              required
              min="1"
              className="input-field mt-1"
              placeholder="e.g., 500"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline *
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              required
              className="input-field mt-1"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700">
              Required Skills *
            </label>
            <input
              type="text"
              id="skillsRequired"
              name="skillsRequired"
              required
              className="input-field mt-1"
              placeholder="e.g., React, Node.js, MongoDB"
              value={formData.skillsRequired}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;