'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileList } from '@/components/dashboard/FileList';

// Define types for our data
export interface FileUpload {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileCategory: string;
  uploadDate: string;
  status: 'Pending' | 'Processing' | 'Verified' | 'Failed' | 'NFT_Minted';
  nftDetails?: {
    tokenId: string;
    contractAddress: string;
    transactionHash: string;
    tokenUri: string;
    mintDate: string;
    blockchain: string;
    owner: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Generate mock data for unauthenticated users
const generateMockData = (): FileUpload[] => {
  const mockStatuses: ('Pending' | 'Processing' | 'Verified' | 'Failed' | 'NFT_Minted')[] = 
    ['Pending', 'Processing', 'Verified', 'Failed', 'NFT_Minted'];
  const mockCategories = ['Census', 'Birth Certificate', 'Marriage Record', 'Death Certificate', 'Military Record'];
  const mockFiles: FileUpload[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const hasNft = status === 'NFT_Minted';
    
    mockFiles.push({
      _id: `mock-${i}`,
      originalName: `${category.replace(/\s+/g, '_').toLowerCase()}_${i}.pdf`,
      fileType: 'application/pdf',
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
      fileCategory: category,
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      status,
      ...(hasNft ? {
        nftDetails: {
          tokenId: `0x${Math.random().toString(16).substr(2, 40)}`,
          contractAddress: '0x1234...5678',
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          tokenUri: 'ipfs://mock-ipfs-hash',
          mintDate: new Date().toISOString(),
          blockchain: 'Ethereum',
          owner: '0x' + Math.random().toString(16).substr(2, 40)
        }
      } : {})
    });
  }
  
  return mockFiles;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessingMint, setIsProcessingMint] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false,
  });
  
  const isAuthenticated = status === 'authenticated';
        } : {})
      });
    }
    
    return mockFiles;
  };
  
  const mockFiles = generateMockData();
  const displayFiles = isAuthenticated ? files : mockFiles;

  // No longer redirecting unauthenticated users
  useEffect(() => {
    // Set loading state based on authentication status
    if (status === 'loading') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status]);

  // Fetch user files
  const fetchFiles = async () => {
    if (!isAuthenticated) {
      // Don't attempt to fetch files for unauthenticated users
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('fileCategory', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/user/files?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files);
      setPagination(data.pagination);
    } catch (err) {
      setError('Error loading your files. Please try again later.');
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and refresh when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, statusFilter, categoryFilter, pagination.page, searchQuery]);

  // Handle minting an NFT
  const mintNFT = async (fileId: string) => {
    if (isProcessingMint) return; // Prevent multiple clicks
    
    setIsProcessingMint(fileId);
    try {
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to mint NFT');
      }
      
      // Refresh the files list
      fetchFiles();
      
    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT');
    } finally {
      setIsProcessingMint(null);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'NFT_Minted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Verified':
      case 'NFT_Minted':
        return '✓';
      case 'Failed':
        return '✗';
      case 'Processing':
        return '⟳';
      default:
        return '⋯';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {isAuthenticated ? 'Your Dashboard' : 'Welcome to AncestryChain'}
      </h1>
      
      {!isAuthenticated && (
        <div className="bg-blue-50 text-blue-800 p-6 mb-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">
            <span className="inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Demo Mode
            </span>
          </h2>
          <p className="mb-4">
            You're viewing demo data. Sign in to see your actual files and start building your family tree.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/login" 
              className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </Link>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-6 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
          <button 
            className="ml-2 text-red-600 hover:text-red-800" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar with filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-4">
            <h2 className="text-xl font-bold mb-4">
              {isAuthenticated ? 'Filters' : 'Demo Filters'}
              {!isAuthenticated && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </h2>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
                  <div className="w-full sm:w-1/3">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search {!isAuthenticated && '(demo)'}
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder={isAuthenticated ? "Search your files..." : "Try searching 'census' or 'birth'..."}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status {!isAuthenticated && '(demo)'}
                    </label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={!isAuthenticated}
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Verified">Verified</option>
                      <option value="Failed">Failed</option>
                      <option value="NFT_Minted">NFT Minted</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category {!isAuthenticated && '(demo)'}
                    </label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      disabled={!isAuthenticated}
                    >
                      <option value="">All Categories</option>
                      <option value="Census">Census</option>
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="Marriage Record">Marriage Record</option>
                      <option value="Death Certificate">Death Certificate</option>
                      <option value="Military Record">Military Record</option>
                    </select>
                  </div>
                </div>
                {!isAuthenticated && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Sign in to filter and search your own files
                  </div>
                )}
              </div>
              <button
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition"
                onClick={() => {
                  setStatusFilter('');
                  setCategoryFilter('');
                  setSearchQuery('');
                  setPagination({...pagination, page: 1});
                }}
              >
                Clear Filters
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/upload" className="text-primary hover:underline">
                    Upload New File
                  </Link>
                </li>
                <li>
                  <Link href="/genealogy" className="text-primary hover:underline">
                    View Family Tree
                  </Link>
                </li>
                <li>
                  <Link href="/verification" className="text-primary hover:underline">
                    Verification Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
                <p className="text-gray-500">Loading your files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h2 className="text-xl font-bold mb-2">No Files Found</h2>
                <p className="text-gray-600 mb-4">
                  You haven't uploaded any files yet or none match your current filters.
                </p>
                <Link href="/upload" className="btn-primary inline-block">
                  Upload Your First File
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {files.map(file => (
                        <tr key={file._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{file.originalName}</div>
                            <div className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.fileCategory}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(file.status)}`}>
                              {getStatusIcon(file.status)} {file.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.uploadDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a 
                              href={`/api/download?fileId=${file._id}`} 
                              className="text-primary hover:underline mr-2"
                            >
                              Download
                            </a>
                            
                            {file.status === 'Verified' && (
                              <button
                                className="mr-2 text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                                onClick={() => mintNFT(file._id)}
                                disabled={isProcessingMint !== null}
                              >
                                {isProcessingMint === file._id ? 'Minting...' : 'Mint NFT'}
                              </button>
                            )}
                            
                            {file.status === 'NFT_Minted' && (
                              <Link href={`/nft/${file._id}`}
                                className="mr-2 text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                              >
                                View NFT
                              </Link>
                            )}
                            
                            <Link
                              href={`/file/${file._id}`}
                              className="text-primary hover:underline mr-2"
                            >
                              View
                            </Link>
                            
                            {file.status !== 'NFT_Minted' && (
                              <Link
                                href={`/verification/${file._id}`}
                                className="text-primary hover:underline"
                              >
                                Verify
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                      disabled={pagination.page === 1}
                      className={`px-4 py-2 rounded ${pagination.page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                      disabled={!pagination.hasMore}
                      className={`px-4 py-2 rounded ${!pagination.hasMore ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Total Files</h3>
              <p className="text-4xl font-bold">{pagination.total || 0}</p>
              <p className="text-gray-600">Uploaded records</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Verified Files</h3>
              <p className="text-4xl font-bold">
                {files.filter(f => f.status === 'Verified' || f.status === 'NFT_Minted').length}
              </p>
              <p className="text-gray-600">Confirmed records</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">NFTs Minted</h3>
              <p className="text-4xl font-bold">
                {files.filter(f => f.status === 'NFT_Minted').length}
              </p>
              <p className="text-gray-600">Blockchain verified</p>
            </div>
          </div>
        </div>
      ) : (
        // Public dashboard content for unauthenticated users
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Verify Your Heritage</h2>
            <p className="text-gray-700 mb-4">
              Upload and verify your genealogy documents securely using blockchain technology.
            </p>
            <div className="text-primary-dark">
              <Link href="/about" className="inline-block hover:underline">
                Learn More →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">NFT Certification</h2>
            <p className="text-gray-700 mb-4">
              Mint NFTs for your verified documents to establish permanent proof of authenticity.
            </p>
            <div className="text-primary-dark">
              <Link href="/verification" className="inline-block hover:underline">
                Explore Verification →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Family Tree Visualization</h2>
            <p className="text-gray-700 mb-4">
              Create interactive family trees based on your verified genealogy records.
            </p>
            <div className="text-primary-dark">
              <Link href="/genealogy" className="inline-block hover:underline">
                View Examples →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
