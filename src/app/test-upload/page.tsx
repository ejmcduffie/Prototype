'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import FileUploader from '@/components/FileUploader';

export default function TestUploadPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test File Upload</h1>
          <p className="text-gray-600">
            Test the file upload functionality with Supabase Storage
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <FileUploader />
        </div>
        
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Drag and drop a file into the upload area or click to select a file</li>
            <li>Wait for the upload to complete</li>
            <li>You should see your uploaded file in the list below</li>
            <li>You can download or delete files using the respective buttons</li>
          </ol>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800">Note:</h3>
            <p className="mt-1 text-sm text-blue-700">
              Files are stored in your private storage bucket and can only be accessed by you.
              Each user's files are stored in a separate folder based on their user ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
