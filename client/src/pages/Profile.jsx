import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PortfolioManager from '../components/portfolio/PortfolioManager';
import ProfilePictureUpload from '../components/upload/ProfilePictureUpload';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    hourlyRate: '',
    experience: '',
    education: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        title: user.profile.title || '',
        description: user.profile.description || '',
        skills: user.profile.skills?.join(', ') || '',
        hourlyRate: user.profile.hourlyRate || '',
        experience: user.profile.experience || '',
        education: user.profile.education || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const profileData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : 0
    };

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Picture Section */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <ProfilePictureUpload />
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={`px-4 py-3 rounded ${
                  message.includes('success') 
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input-field"
                    placeholder="e.g., Senior React Developer"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    className="input-field"
                    placeholder="e.g., 50"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  About Me *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="input-field"
                  placeholder="Describe your experience, skills, and what you can offer to clients..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills *
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="input-field"
                  placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Separate skills with commas. Be specific about your expertise.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows="3"
                    className="input-field"
                    placeholder="Describe your professional background, previous roles, and achievements..."
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                    Education & Certifications
                  </label>
                  <textarea
                    id="education"
                    name="education"
                    rows="3"
                    className="input-field"
                    placeholder="List your degrees, certifications, and relevant education..."
                    value={formData.education}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Portfolio Section (Freelancers only) */}
          {user?.role === 'freelancer' && (
            <PortfolioManager />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-2">✓</span>
              Profile Strength
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Basic Info</span>
                <span className="font-semibold text-green-600">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Profile Picture</span>
                <span className={user?.profile?.profilePicture ? "font-semibold text-green-600" : "text-orange-600"}>
                  {user?.profile?.profilePicture ? "Added" : "Not added"}
                </span>
              </div>
              {user?.role === 'freelancer' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Portfolio</span>
                  <span className={user?.profile?.portfolio?.length > 0 ? "font-semibold text-green-600" : "text-orange-600"}>
                    {user?.profile?.portfolio?.length > 0 ? `${user.profile.portfolio.length} items` : "No items"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Member since</span>
                <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {user?.role === 'freelancer' && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{user?.profile?.portfolio?.length || 0}</div>
                  <div className="text-xs text-gray-600">Portfolio Items</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{user?.profile?.skills?.length || 0}</div>
                  <div className="text-xs text-gray-600">Skills</div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Profile Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Complete all sections for better visibility
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Use specific skills that clients search for
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Add portfolio items to showcase your work
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Set a competitive but fair hourly rate
              </li>
              {user?.role === 'freelancer' && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Upload your best work samples to attract clients
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;