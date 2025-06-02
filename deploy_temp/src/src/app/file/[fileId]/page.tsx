'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type FileDetails = {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileCategory: string;
  uploadDate: string;
  status: string;
  verificationHash?: string;
  path?: string;
  nftDetails?: {
    tokenId: string;
    contractAddress: string;
    transactionHash: string;
    tokenUri: string;
    mintDate: string;
    blockchain: string;
    owner: string;
  };
};

export default function FileDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [file, setFile] = useState<FileDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/file/${params.fileId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch file details');
        }
        const data = await response.json();
        setFile(data.file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.fileId && status === 'authenticated') {
      fetchFile();
    }
  }, [params.fileId, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading file details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          {error}
          <button 
            className="ml-2 text-red-600 hover:text-red-800" 
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
          File not found
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{file.originalName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">File Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">File Name</h3>
                <p className="mt-1 text-sm text-gray-900">{file.originalName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">File Type</h3>
                <p className="mt-1 text-sm text-gray-900">{file.fileType.toUpperCase()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">File Size</h3>
                <p className="mt-1 text-sm text-gray-900">{formatFileSize(file.fileSize)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{file.fileCategory}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(file.uploadDate)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{file.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {file.nftDetails && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">NFT Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Token ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{file.nftDetails.tokenId}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contract Address</h3>
                  <p className="mt-1 text-sm text-gray-900 break-all">{file.nftDetails.contractAddress}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction Hash</h3>
                  <p className="mt-1 text-sm text-gray-900 break-all">{file.nftDetails.transactionHash}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mint Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(file.nftDetails.mintDate)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Blockchain</h3>
                  <p className="mt-1 text-sm text-gray-900">{file.nftDetails.blockchain}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Token URI</h3>
                <p className="mt-1 text-sm text-gray-900 break-all">{file.nftDetails.tokenUri}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <button
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition"
                onClick={() => router.back()}
              >
                Back to Dashboard
              </button>
              
              {!file.nftDetails && (
                <button
                  onClick={() => {
                    // Will implement blockchain writing functionality
                    alert(`Preparing to write ${file.originalName} to blockchain...`);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition mb-2"
                >
                  Write to Blockchain
                </button>
              )}
              
              {file.status === 'Verified' && !file.nftDetails && (
                <Link
                  href={`/nft/mint?fileId=${file._id}`}
                  className="block w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition text-center"
                >
                  Mint as NFT
                </Link>
              )}
              
              {file.nftDetails && (
                <Link
                  href={`https://etherscan.io/tx/${file.nftDetails.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-100 text-purple-800 py-2 px-4 rounded hover:bg-purple-200 transition text-center"
                >
                  View on Blockchain Explorer
                </Link>
              )}
              
              <Link
                href={`/api/download?fileId=${params.fileId}`}
                className="block w-full bg-blue-100 text-blue-800 py-2 px-4 rounded hover:bg-blue-200 transition text-center"
              >
                Download File
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
