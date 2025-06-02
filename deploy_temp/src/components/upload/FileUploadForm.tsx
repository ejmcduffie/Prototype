"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface FileUploadFormProps {
  fileCategory: 'GEDCOM' | 'SlaveRecord' | 'HistoricalDocument' | 'FamilyTree' | 'DNATest' | 'Other' | 'All';
  allowedExtensions?: string[];
  maxSizeMB?: number;
  title: string;
  description: string;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  fileCategory,
  allowedExtensions = ['.ged'],
  maxSizeMB = 25,
  title,
  description
}) => {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    fileId?: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    if (!session) {
      router.push('/login');
      return;
    }
    // Validate file extension
    const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setUploadStatus({
        success: false,
        message: `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`
      });
      return;
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setUploadStatus({
        success: false,
        message: `File too large. Maximum size allowed is ${maxSizeMB}MB`
      });
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
  };

  const handleButtonClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    inputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (!file) {
      setUploadStatus({
        success: false,
        message: 'Please select a file to upload'
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'placeholder-user-id'); // In a real app, get from authentication
      formData.append('fileCategory', fileCategory);

      // Send request to the API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: 'File uploaded successfully!',
          fileId: result.fileId
        });
        setFile(null);
        
        // Refresh the file list if this component is used in a page with a file list
        router.refresh();
      } else {
        setUploadStatus({
          success: false,
          message: result.error || 'Failed to upload file'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        success: false,
        message: 'An error occurred during file upload'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-6 text-gray-700">{description}</p>
      
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed ${dragActive ? 'border-primary' : 'border-gray-300'} rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {file ? (
            <div className="mb-4">
              <p className="text-gray-800 font-medium">Selected File:</p>
              <p className="text-primary">{file.name}</p>
              <p className="text-gray-500 text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
          )}
          
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleButtonClick}
          >
            Browse Files
          </button>
          
          <input 
            type="file"
            ref={inputRef}
            className="hidden"
            accept={allowedExtensions.join(',')} 
            onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
          />
          
          <p className="text-xs text-gray-500 mt-2">
            Supported files: {allowedExtensions.join(', ')} (Max size: {maxSizeMB}MB)
          </p>
        </div>
        
        {uploadStatus && (
          <div className={`p-4 mb-6 rounded-lg ${uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center">
              {uploadStatus.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{uploadStatus.message}</span>
            </div>
            {uploadStatus.success && uploadStatus.fileId && (
              <p className="mt-2 text-sm">
                File ID: <span className="font-mono">{uploadStatus.fileId}</span>
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button 
            type="submit"
            className="btn-primary px-8"
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload and Verify'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileUploadForm;
