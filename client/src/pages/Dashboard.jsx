import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    recentJobs: [],
    recentProposals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs data
      const jobsResponse = await api.get(user?.role === 'client' ? '/jobs/client/my-jobs' : '/jobs');
      const jobs = jobsResponse.data;

      // Fetch proposals data
      let proposals = [];
      if (user?.role === 'freelancer') {
        const proposalsResponse = await api.get('/proposals/my-proposals');
        proposals = proposalsResponse.data;
      } else if (user?.role === 'client') {
        // For clients, we need to get proposals for all their jobs
        const jobIds = jobs.map(job => job._id);
        if (jobIds.length > 0) {
          const allProposals = await Promise.all(
            jobIds.map(jobId => 
              api.get(`/proposals/job/${jobId}`).catch(() => ({ data: [] }))
            )
          );
          proposals = allProposals.flatMap(response => response.data);
        }
      }

      // Calculate statistics
      const pendingProposals = proposals.filter(p => p.status === 'pending').length;
      const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;

      setStats({
        totalJobs: jobs.length,
        totalProposals: proposals.length,
        pendingProposals,
        acceptedProposals,
        recentJobs: jobs.slice(0, 3), // Last 3 jobs
        recentProposals: proposals.slice(0, 3) // Last 3 proposals
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              {user?.role === 'client' 
                ? 'Manage your jobs and review proposals from talented freelancers.'
                : 'Find your next project and grow your freelance business.'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Jobs Card */}
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.totalJobs}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {user?.role === 'client' ? 'Jobs Posted' : 'Available Jobs'}
              </div>
            </div>

            {/* Total Proposals Card */}
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.totalProposals}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {user?.role === 'client' ? 'Total Proposals' : 'My Proposals'}
              </div>
            </div>

            {/* Pending Proposals Card */}
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {stats.pendingProposals}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Pending
              </div>
            </div>

            {/* Accepted Proposals Card */}
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.acceptedProposals}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Accepted
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              {user?.role === 'client' ? (
                <div className="space-y-3">
                  <Link to="/post-job" className="btn-primary block text-center">
                    Post a New Job
                  </Link>
                  <Link to="/jobs" className="btn-secondary block text-center">
                    Browse All Jobs
                  </Link>
                  {stats.totalJobs > 0 && (
                    <Link to="/jobs" className="btn-secondary block text-center">
                      View My Jobs ({stats.totalJobs})
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/jobs" className="btn-primary block text-center">
                    Find Jobs ({stats.totalJobs} available)
                  </Link>
                  <Link to="/profile" className="btn-secondary block text-center">
                    Update Profile
                  </Link>
                  {stats.totalProposals > 0 && (
                    <Link to="/jobs" className="btn-secondary block text-center">
                      My Proposals ({stats.totalProposals})
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Profile Summary */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <div className="space-y-2 mb-4">
                <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
                <p><strong>Email:</strong> {user?.email}</p>
                {user?.profile?.title && (
                  <p><strong>Title:</strong> {user.profile.title}</p>
                )}
                {user?.profile?.hourlyRate && (
                  <p><strong>Hourly Rate:</strong> ${user.profile.hourlyRate}/hr</p>
                )}
              </div>
              <Link to="/profile" className="btn-primary inline-block">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Jobs */}
            {user?.role === 'client' && stats.recentJobs.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
                <div className="space-y-3">
                  {stats.recentJobs.map(job => (
                    <div key={job._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">{job.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>${job.budget}</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/jobs" className="btn-secondary mt-4 inline-block text-sm">
                  View All Jobs
                </Link>
              </div>
            )}

            {/* Recent Proposals */}
            {stats.recentProposals.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">
                  {user?.role === 'client' ? 'Recent Proposals' : 'My Recent Proposals'}
                </h2>
                <div className="space-y-3">
                  {stats.recentProposals.map(proposal => (
                    <div key={proposal._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">
                          {user?.role === 'client' 
                            ? proposal.freelancer?.name || 'Freelancer'
                            : proposal.job?.title || 'Job'
                          }
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>${proposal.bidAmount}</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/jobs" className="btn-secondary mt-4 inline-block text-sm">
                  {user?.role === 'client' ? 'View All Proposals' : 'View All My Proposals'}
                </Link>
              </div>
            )}
          </div>

          {/* Getting Started Guide */}
          <div className="card mt-8">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            {user?.role === 'client' ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Post Jobs</h3>
                  <p className="text-sm text-gray-600">Create detailed job postings to attract freelancers</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Review Proposals</h3>
                  <p className="text-sm text-gray-600">Evaluate proposals and select the best freelancer</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Manage Projects</h3>
                  <p className="text-sm text-gray-600">Collaborate and track project progress</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Complete Profile</h3>
                  <p className="text-sm text-gray-600">Showcase your skills and experience to clients</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Find projects that match your skills and interests</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Submit Proposals</h3>
                  <p className="text-sm text-gray-600">Apply to jobs with competitive bids and timelines</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;