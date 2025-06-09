'use client';

import Link from 'next/link';
import { FileUpload } from '@/app/dashboard/page';

interface FileListProps {
  files: FileUpload[];
  isAuthenticated: boolean;
  onMintNFT: (fileId: string) => Promise<void>;
  isProcessingMint: string | null;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

type FileListProps = {
  files: FileUpload[];
  isAuthenticated: boolean;
  onMintNFT?: (fileId: string) => void;
  isProcessingMint: string | null;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
};

export function FileList({
  files,
  isAuthenticated,
  onMintNFT,
  isProcessingMint,
  formatDate,
  formatFileSize,
  getStatusColor,
  getStatusIcon,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold mb-2">
          {isAuthenticated ? 'No Files Found' : 'No Demo Files Available'}
        </h2>
        <p className="text-gray-600 mb-4">
          {isAuthenticated 
            ? "You haven't uploaded any files yet or none match your current filters."
            : 'No demo files are currently available. Please check back later.'}
          }
        </p>
        {isAuthenticated && (
          <Link href="/upload" className="btn-primary inline-block">
            Upload Your First File
          </Link>
        )}
      </div>
    );
  }

  return (
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
          {files.map((file) => (
            <tr key={file._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {file.originalName}
                  {!isAuthenticated && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Demo
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{file.fileCategory}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(file.status)}`}
                >
                  {getStatusIcon(file.status)} {file.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(file.uploadDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {isAuthenticated ? (
                  <>
                    <a 
                      href={`/api/download?fileId=${file._id}`} 
                      className="text-primary hover:underline mr-2"
                    >
                      Download
                    </a>
                    
                    {file.status === 'Verified' && (
                      <button
                        className="mr-2 text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                        onClick={() => onMintNFT?.(file._id)}
                        disabled={isProcessingMint !== null}
                      >
                        {isProcessingMint === file._id ? 'Minting...' : 'Mint NFT'}
                      </button>
                    )}
                    
                    {file.status === 'NFT_Minted' && (
                      <Link 
                        href={`/nft/${file._id}`}
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
                  </>
                ) : (
                  <span className="text-gray-400">Sign in to interact</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
