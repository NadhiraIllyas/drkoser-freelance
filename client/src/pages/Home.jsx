import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Perfect Freelance Services
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with skilled freelancers or find your next project. 
            Build your career on the world's top freelance platform.
          </p>
          <div className="flex justify-center space-x-4">
            {!user ? (
              <>
                <Link to="/register?role=client" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Hire Talent
                </Link>
                <Link to="/register?role=freelancer" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3">
                  Find Work
                </Link>
              </>
            ) : (
              <Link to={user.role === 'client' ? '/post-job' : '/jobs'} className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FreelanceHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Easy</h3>
              <p className="text-gray-600">Post projects and get proposals in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Work</h3>
              <p className="text-gray-600">Connect with verified professionals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and reliable payment system</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up as a client or freelancer in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">{user?.role === 'client' ? 'Post Projects' : 'Find Work'}</h3>
              <p className="text-gray-600">
                {user?.role === 'client' 
                  ? 'Post your project and receive proposals' 
                  : 'Browse jobs and submit proposals'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
              <p className="text-gray-600">Work together and complete projects successfully</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Active Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">200+</div>
              <div className="text-blue-100">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$50K+</div>
              <div className="text-blue-100">Earned by Freelancers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of clients and freelancers already using FreelanceHub
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link to="/register?role=client" className="btn-primary text-lg px-8 py-3">
                Start Hiring
              </Link>
              <Link to="/register?role=freelancer" className="btn-secondary text-lg px-8 py-3">
                Start Earning
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;