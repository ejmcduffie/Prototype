'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

// Extend the File type to include preview
interface FileWithPreview extends File {
  preview?: string;
}

type FileItem = {
  name: string;
  fullPath: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified?: string;
    eTag: string;
  };
  url: string;
};

export default function FileUploader() {
  const { files, isUploading, error, uploadFile, deleteFile, downloadFile, fetchFiles } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<FileWithPreview | null>(null);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (fileToUpload && fileToUpload.preview) {
        URL.revokeObjectURL(fileToUpload.preview);
      }
    };
  }, [fileToUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: FileWithPreview) => {
    // Create preview for images
    const fileWithPreview = file.type.startsWith('image/') 
      ? Object.assign(file, { preview: URL.createObjectURL(file) })
      : file;
    
    setFileToUpload(fileWithPreview);
    
    try {
      await uploadFile(file);
      await fetchFiles(); // Refresh the file list after upload
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setFileToUpload(null);
    }
  };

  const handleDelete = async (filePath: string) => {
    await deleteFile(filePath);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    await downloadFile(filePath, fileName);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 mx-auto"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleChange}
                disabled={isUploading}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PDF, JPG, PNG up to 10MB
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Uploading file...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Files</h3>
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {files.map((file: FileItem) => (
                <li key={file.name}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-blue-600 truncate">
                            {file.name}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>{formatFileSize(file.metadata.size)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => handleDownload(file.fullPath, file.name)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(file.fullPath)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
