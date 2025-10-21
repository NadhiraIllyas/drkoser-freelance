import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import FileUpload from '../upload/FileUpload';

const PortfolioManager = () => {
  const { user, updateProfile } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '' });

  useEffect(() => {
    if (user?.profile?.portfolio) {
      setPortfolioItems(user.profile.portfolio);
    }
  }, [user]);

  const handleAddPortfolioItem = async (uploadedFiles) => {
    if (uploadedFiles.length === 0 || !newItem.title.trim()) return;

    setLoading(true);
    try {
      const portfolioItem = {
        title: newItem.title,
        description: newItem.description,
        fileUrl: uploadedFiles[0].url,
        fileType: uploadedFiles[0].format
      };

      const updatedPortfolio = [...portfolioItems, portfolioItem];
      
      const result = await updateProfile({
        portfolio: updatedPortfolio
      });

      if (result.success) {
        setNewItem({ title: '', description: '' });
        setPortfolioItems(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePortfolioItem = async (index) => {
    try {
      const updatedPortfolio = portfolioItems.filter((_, i) => i !== index);
      
      const result = await updateProfile({
        portfolio: updatedPortfolio
      });

      if (result.success) {
        setPortfolioItems(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error removing portfolio item:', error);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Portfolio Management</h2>
      
      {/* Add New Portfolio Item */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add Portfolio Item</h3>
        
        <div className="grid gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="e.g., E-commerce Website Redesign"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Describe this project and your role..."
              rows="3"
              className="input-field"
            />
          </div>
        </div>

        <FileUpload
          onUploadComplete={handleAddPortfolioItem}
          maxFiles={1}
          acceptedTypes={['image/*', 'application/pdf']}
        />
      </div>

      {/* Portfolio Items List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Your Portfolio ({portfolioItems.length} items)
        </h3>
        
        {portfolioItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📁</div>
            <p>No portfolio items yet. Add your first project!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {portfolioItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {item.fileType.toUpperCase()}</span>
                      <span>•</span>
                      <span>Added: {new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm px-3 py-1"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleRemovePortfolioItem(index)}
                      className="btn-secondary text-sm px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Image Preview */}
                {item.fileType.startsWith('image/') && (
                  <div className="mt-3">
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="max-w-xs rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;