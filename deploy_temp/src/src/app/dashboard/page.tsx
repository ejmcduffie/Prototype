'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define types for our data
interface FileUpload {
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessingMint, setIsProcessingMint] = useState<string | null>(null);
  const isAuthenticated = status === 'authenticated';

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
      <h1 className="text-3xl font-bold mb-8">{isAuthenticated ? 'Your Dashboard' : 'Welcome to AncestryChain'}</h1>
      
      {!isAuthenticated && (
        <div className="bg-blue-50 text-blue-800 p-6 mb-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-3">Sign in to access your personal dashboard</h2>
          <p className="mb-4">Create an account or sign in to upload, verify, and mint NFTs for your genealogy records.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition">
              Sign In
            </Link>
            <Link href="/register" className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition">
              Register
            </Link>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-6 rounded-lg">
          {error}
          <button 
            className="ml-2 text-red-600 hover:text-red-800" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {isAuthenticated ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left sidebar with filters - only shown to authenticated users */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Verified">Verified</option>
                  <option value="NFT_Minted">NFT Minted</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="GEDCOM">GEDCOM</option>
                  <option value="HistoricalDocument">Historical Document</option>
                  <option value="SlaveRecord">Slave Record</option>
                  <option value="FamilyTree">Family Tree</option>
                  <option value="DNATest">DNA Test</option>
                  <option value="Other">Other</option>
                </select>
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
