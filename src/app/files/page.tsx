'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import FileUploader from '@/components/FileUploader';

export default function FilesPage() {
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
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Files</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.email}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <FileUploader />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
