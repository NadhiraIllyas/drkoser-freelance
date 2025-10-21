import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFileUpload from '../../hooks/useFileUpload';

const ProfilePictureUpload = () => {
  const { user, updateProfile } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [error, setError] = useState('');

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    const result = await uploadFile(file);

    if (result.success) {
      const updateResult = await updateProfile({
        profilePicture: result.data.file.url
      });

      if (!updateResult.success) {
        setError('Failed to update profile picture');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Current Profile Picture */}
      <div className="relative">
        {user?.profile?.profilePicture ? (
          <img
            src={user.profile.profilePicture}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500">
            Recommended: Square image, max 5MB. JPG, PNG, or GIF.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;