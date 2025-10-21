import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import SubmitProposal from '../components/proposals/SubmitProposal';

const JobDetails = () => {
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobDetails();
    if (user?.role === 'client') {
      fetchProposals();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await api.get(`/proposals/job/${id}`);
      setProposals(response.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleStatusUpdate = async (proposalId, status) => {
    try {
      await api.put(`/proposals/${proposalId}/status`, { status });
      alert(`Proposal ${status} successfully!`);
      fetchProposals();
      fetchJobDetails(); // Refresh job status if accepted
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating proposal');
    }
  };

  const startConversation = async (freelancerId) => {
    try {
      const response = await api.post('/messages/conversations', {
        participantId: freelancerId,
        jobId: job._id
      });
      
      // Navigate to messages page with the conversation
      navigate(`/messages/${response.data._id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error starting conversation. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProposalStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatCategory = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs" className="btn-primary">
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isJobOwner = user && job.client._id === user.id;
  const hasAcceptedProposal = proposals.some(p => p.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>
        
        {user?.role === 'freelancer' && job.status === 'open' && (
          <button
            onClick={() => setShowProposalModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Apply Now</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Posted by {job.client.name}</span>
                </div>
              </div>
              
              <div className="sm:text-right mt-4 sm:mt-0">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(job.budget)}
                </div>
                <div className="text-sm text-gray-600">
                  Fixed Price
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-2">
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{formatCategory(job.category)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Job Type</span>
                    <span className="font-medium">Fixed Project</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Proposals Section (Visible only to job owner) */}
          {isJobOwner && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Proposals</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'}
                  </span>
                  {hasAcceptedProposal && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Hired
                    </span>
                  )}
                </div>
              </div>
              
              {proposals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
                  <p className="text-gray-600">Proposals will appear here when freelancers apply to your job.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {proposal.freelancer.name?.charAt(0) || 'F'}
                              </div>
                              {isUserOnline(proposal.freelancer._id) && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{proposal.freelancer.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs border ${getProposalStatusColor(proposal.status)}`}>
                                  {proposal.status}
                                </span>
                              </div>
                              {proposal.freelancer.profile?.title && (
                                <p className="text-gray-600 text-sm">{proposal.freelancer.profile.title}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Cover Letter</h4>
                            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                              {proposal.coverLetter}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="font-semibold text-green-600">{formatCurrency(proposal.bidAmount)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{proposal.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Applied {new Date(proposal.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 lg:items-end">
                          {proposal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                                className="btn-primary text-sm px-4 py-2"
                              >
                                Accept Proposal
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                                className="btn-secondary text-sm px-4 py-2"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {proposal.status === 'accepted' && (
                            <button
                              onClick={() => startConversation(proposal.freelancer._id)}
                              className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>Message</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About the Client
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {job.client.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-semibold">{job.client.name}</p>
                  {job.client.profile?.title && (
                    <p className="text-sm text-gray-600">{job.client.profile.title}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Member since {new Date(job.client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          {user?.role === 'freelancer' && job.status === 'open' && (
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ready to Apply?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Submit your proposal to get started with this project. Make sure to include:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your relevant experience
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Competitive bid amount
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Realistic timeline
                </li>
              </ul>
              <button
                onClick={() => setShowProposalModal(true)}
                className="btn-primary w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Proposal
              </button>
            </div>
          )}

          {/* Job Stats Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Job Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Proposals</span>
                <span className="font-medium">{proposals.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-sm">{new Date(job.updatedAt || job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <SubmitProposal 
          job={job} 
          onClose={() => setShowProposalModal(false)} 
        />
      )}
    </div>
  );
};

export default JobDetails;