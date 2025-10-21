import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    skills: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, filters, sortBy]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = jobs.filter(job => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = filters.category === '' || job.category === filters.category;

      // Budget filter
      const matchesMinBudget = filters.minBudget === '' || job.budget >= parseInt(filters.minBudget);
      const matchesMaxBudget = filters.maxBudget === '' || job.budget <= parseInt(filters.maxBudget);

      // Skills filter
      const matchesSkills = filters.skills === '' || 
        job.skillsRequired.some(skill => 
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        );

      return matchesSearch && matchesCategory && matchesMinBudget && matchesMaxBudget && matchesSkills;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'budget-high':
          return b.budget - a.budget;
        case 'budget-low':
          return a.budget - b.budget;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      minBudget: '',
      maxBudget: '',
      skills: ''
    });
    setSortBy('newest');
  };

  const getCategoryCount = (category) => {
    return jobs.filter(job => job.category === category).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  const categories = [
    'web-development', 'mobile-development', 'graphic-design', 
    'content-writing', 'digital-marketing', 'seo', 'data-entry', 'customer-service'
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-1">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            {jobs.length !== filteredJobs.length && ` (filtered from ${jobs.length} total)`}
          </p>
        </div>
        {user?.role === 'client' && (
          <Link to="/post-job" className="btn-primary whitespace-nowrap">
            Post a Job
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Jobs
            </label>
            <input
              type="text"
              placeholder="Search by title or description..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="input-field"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {' '}({getCategoryCount(category)})
                </option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Budget
              </label>
              <input
                type="number"
                placeholder="Min"
                className="input-field"
                value={filters.minBudget}
                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Budget
              </label>
              <input
                type="number"
                placeholder="Max"
                className="input-field"
                value={filters.maxBudget}
                onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
              />
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <input
              type="text"
              placeholder="Filter by skills..."
              className="input-field"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
            />
          </div>
        </div>

        {/* Sort and Clear Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              className="input-field text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          
          {(searchTerm || filters.category || filters.minBudget || filters.maxBudget || filters.skills) && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6">
        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "There are no jobs available yet. Be the first to post one!"
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {jobs.length === 0 && user?.role === 'client' && (
              <Link to="/post-job" className="btn-primary">
                Post First Job
              </Link>
            )}
            {(searchTerm || filters.category || filters.minBudget || filters.maxBudget || filters.skills) && (
              <button
                onClick={clearFilters}
                className="btn-secondary mt-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${job.budget}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skillsRequired.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{job.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏰</span>
                      <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📁</span>
                      <span className="capitalize">{job.category.replace('-', ' ')}</span>
                    </div>
                    {job.client?.name && (
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span>By {job.client.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn-primary text-center"
                  >
                    {user?.role === 'freelancer' ? 'Apply Now' : 'View Details'}
                  </Link>
                  {user?.role === 'freelancer' && job.status === 'open' && (
                    <div className="text-center text-sm text-green-600 font-medium">
                      🎯 Accepting Proposals
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {jobs.length > 0 && (
        <div className="mt-8 card">
          <h3 className="font-semibold mb-4">Job Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter(job => job.status === 'open').length}
              </div>
              <div className="text-sm text-gray-600">Open Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(jobs.reduce((sum, job) => sum + job.budget, 0) / jobs.length) || 0}
              </div>
              <div className="text-sm text-gray-600">Avg. Budget</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {categories.reduce((max, cat) => {
                  const count = getCategoryCount(cat);
                  return count > max ? count : max;
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Most Popular Category</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;