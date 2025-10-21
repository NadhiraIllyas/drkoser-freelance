import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FH</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">FreelanceHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <>
                <Link 
                  to="/jobs" 
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/jobs') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Jobs
                </Link>
                
                {user.role === 'client' && (
                  <Link 
                    to="/post-job" 
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActive('/post-job') 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    Post a Job
                  </Link>
                )}
                
                <Link 
                  to="/messages" 
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/messages') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Messages
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/profile') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Profile
                </Link>
                
                {/* User dropdown (can be enhanced later) */}
                <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-gray-200">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/jobs" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Browse Jobs
                </Link>
                
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Login
                </Link>
                
                <Link 
                  to="/register" 
                  className="btn-primary text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;