import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onSuccess, onError, onLoadingChange }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      onError('Invalid file type. Please upload an image (JPEG, PNG), PDF, or DOCX file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      onError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    onLoadingChange(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5001/api/timetable/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        onError(response.data.error || 'Failed to extract timetable');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload file';
      onError(errorMessage);
    } finally {
      setIsUploading(false);
      onLoadingChange(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2>Upload Your Timetable</h2>
          <p>Support for images, PDFs, and DOCX files</p>
        </div>

        {!file ? (
          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <div className="dropzone-content">
              <div className="upload-icon">📁</div>
              <h3>Drag & Drop your file here</h3>
              <p>or</p>
              <button type="button" className="btn btn-outline">
                Browse Files
              </button>
              <p className="file-info">
                Supported: JPEG, PNG, PDF, DOCX (max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.docx"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-info-box">
              <div className="file-icon">
                {file.type.startsWith('image/') ? '🖼️' : 
                 file.type === 'application/pdf' ? '📄' : '📝'}
              </div>
              <div className="file-details">
                <h4>{file.name}</h4>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!isUploading && (
                <button onClick={handleReset} className="btn-remove" title="Remove file">
                  ✕
                </button>
              )}
            </div>

            {isUploading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing timetable...'}
                </p>
              </div>
            )}

            {!isUploading && (
              <div className="upload-actions">
                <button onClick={handleUpload} className="btn btn-primary">
                  Extract Timetable
                </button>
              </div>
            )}
          </div>
        )}

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>AI-Powered</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Fast Processing</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>High Accuracy</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Any Format</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

