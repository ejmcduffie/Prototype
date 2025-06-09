import { useState, useCallback } from 'react';
import { uploadFile, listUserFiles, deleteFile as deleteFileFromStorage, downloadFile as downloadFileFromStorage } from '@/lib/storage';
import useUser from '@/hooks/useUser';

export interface StorageFile {
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
}

export const useFileUpload = () => {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);

  // Fetch user's files
  const fetchFiles = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error: fetchError } = await listUserFiles(user.id);
      if (fetchError) throw fetchError;
      setFiles(data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    }
  }, [user?.id]);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    if (!user?.id) {
      setError('You must be logged in to upload files');
      return { success: false };
    }

    setIsUploading(true);
    setError(null);

    try {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const { path, error: uploadError } = await uploadFile(file, user.id);
      
      if (uploadError) throw uploadError;
      if (!path) throw new Error('Failed to upload file');

      // Refresh the file list
      await fetchFiles();
      return { success: true };
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  }, [user?.id, fetchFiles]);

  // Handle file download
  const handleDownload = useCallback(async (filePath: string, fileName: string) => {
    try {
      const { url, error: downloadError } = await downloadFileFromStorage(filePath);
      
      if (downloadError) throw downloadError;
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Revoke the blob URL after download
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return { success: true };
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file');
      return { success: false };
    }
  }, []);

  // Handle file deletion
  const handleDelete = useCallback(async (filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return { success: false };
    }

    try {
      const { error: deleteError } = await deleteFileFromStorage(filePath);
      
      if (deleteError) throw deleteError;
      
      // Update the file list
      await fetchFiles();
      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
      return { success: false };
    }
  }, [fetchFiles]);

  return {
    files,
    isUploading,
    error,
    uploadFile: handleUpload,
    downloadFile: handleDownload,
    deleteFile: handleDelete,
    fetchFiles,
  };
};
