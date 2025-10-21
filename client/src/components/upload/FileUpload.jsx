import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import useFileUpload from '../../hooks/useFileUpload';

const FileUpload = ({ onUploadComplete, maxFiles = 1, acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'] }) => {
  const { uploadFile, uploading, progress, error } = useFileUpload();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const results = [];
    for (const file of acceptedFiles) {
      const result = await uploadFile(file);
      if (result.success) {
        results.push(result.data.file);
        setUploadedFiles(prev => [...prev, result.data.file]);
      }
    }

    if (onUploadComplete) {
      onUploadComplete(results);
    }
  }, [uploadFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: uploading
  });

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📤</div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="font-medium text-gray-700">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports images, PDFs, and documents (Max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getFileIcon(file.format)}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">{file.original_filename}</p>
                  <p className="text-xs text-gray-500">
                    {(file.bytes / 1024).toFixed(1)} KB • {file.format.toUpperCase()}
                  </p>
                </div>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;