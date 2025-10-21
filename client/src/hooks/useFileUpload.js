import { useState } from 'react';
import api from '../services/api';

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      setUploading(false);
      return { success: true, data: response.data };
    } catch (error) {
      setUploading(false);
      setError(error.response?.data?.message || 'Upload failed');
      return { success: false, error: error.response?.data?.message || 'Upload failed' };
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error,
    setError
  };
};

export default useFileUpload;