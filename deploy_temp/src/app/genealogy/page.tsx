'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Dynamically import the FamilyTree component with SSR disabled
const FamilyTree = dynamic(() => import('@/components/FamilyTree'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Loading your family tree...</p>
    </div>
  ),
});

// Define the structure of a family member
type FamilyMember = {
  id: string;
  name: string;
  givenName: string;
  surname: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'M' | 'F' | 'U';
  children?: FamilyMember[];
  partners?: FamilyMember[];
};

// Define the structure of the family tree data
type FamilyTreeResponse = {
  tree: FamilyMember;
  fileName: string;
  uploadDate: string;
  warning?: string;
};

// Example family tree data
const exampleTreeData: FamilyTreeResponse = {
  tree: {
    id: '1',
    name: 'John Smith',
    givenName: 'John',
    surname: 'Smith',
    birthDate: '1955',
    gender: 'M',
    children: [
      {
        id: '2',
        name: 'Robert Smith',
        givenName: 'Robert',
        surname: 'Smith',
        birthDate: '1925',
        deathDate: '2010',
        gender: 'M',
        children: [
          {
            id: '3',
            name: 'James Smith',
            givenName: 'James',
            surname: 'Smith',
            birthDate: '1895',
            deathDate: '1975',
            gender: 'M',
            children: [
              {
                id: '4',
                name: 'William Smith',
                givenName: 'William',
                surname: 'Smith',
                birthDate: '1865',
                deathDate: '1940',
                gender: 'M',
                children: [
                  {
                    id: '5',
                    name: 'Thomas Smith',
                    givenName: 'Thomas',
                    surname: 'Smith',
                    birthDate: '1835',
                    deathDate: '1905',
                    gender: 'M'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  fileName: 'example.ged',
  uploadDate: new Date().toISOString()
};

// Remove the duplicate FamilyTreeData interface since we're using FamilyMember type

export default function Genealogy() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyTreeData, setFamilyTreeData] = useState<FamilyTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExample, setShowExample] = useState(false);

  // Fetch family tree data when component mounts or session changes
  useEffect(() => {
    const fetchFamilyTree = async () => {
      if (status === 'loading') return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/family-tree');
        const data = await response.json();
        
        if (!response.ok) {
          // If no GEDCOM files found, show the example tree
          if (data.code === 'NO_GEDCOM_FILES') {
            setShowExample(true);
            setError('No verified GEDCOM files found. Showing example data.');
            return;
          }
          throw new Error(data.error || 'Failed to load family tree');
        }
        
        setFamilyTreeData(data);
        setShowExample(false);
      } catch (err) {
        console.error('Error fetching family tree:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        
        // If there's an error but we're not logged in, show the example
        if (status === 'unauthenticated') {
          setShowExample(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchFamilyTree();
    } else {
      setLoading(false);
      setShowExample(true);
    }
  }, [status, router]);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Show sign-in prompt for unauthenticated users
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Family Tree</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sign In to View Your Family Tree</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view and interact with your family tree. If you don't have an account, you can register for free.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/auth/signin" 
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-center"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Example Family Tree</h2>
          <p className="text-gray-600 mb-6">
            Here's an example of what your family tree will look like after you sign in and upload a GEDCOM file.
          </p>
          <div className="border rounded-lg p-4">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            }>
              <FamilyTree initialData={exampleTreeData} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error message if there was an error
  if (error && !showExample) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
        
        {showExample && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Example Family Tree</h2>
            <div className="border rounded-lg p-4">
              <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                <FamilyTree initialData={exampleTreeData} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Show empty state if no family tree data is available
  if (!familyTreeData && !showExample) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No family tree found</h2>
          <p className="mt-2 text-gray-600">
            Upload a GEDCOM file to visualize your family tree.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload GEDCOM File
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Family Tree Visualization</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {isAuthenticated ? 'Your Family Tree' : 'Example Family Tree'}
            </h2>
            <p className="text-gray-600">
              {isAuthenticated 
                ? 'Interactive visualization of your verified ancestral lineage'
                : 'See how your family tree could look with AncestryChain'}
            </p>
          </div>
          {isAuthenticated && (
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link 
                href="/upload" 
                className="btn-primary inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload GEDCOM
              </Link>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isAuthenticated ? (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            <FamilyTree />
          </Suspense>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
              <h3 className="text-xl font-bold mb-4">Sign In to View Your Family Tree</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Create an account or sign in to upload your GEDCOM file and visualize your family history.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="btn-primary px-6 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn-outline px-6 py-2"
                >
                  Register
                </Link>
              </div>
            </div>
            <div className="opacity-50 pointer-events-none">
              <FamilyTree initialData={exampleTreeData} />
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Verified Ancestors</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Birth Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Sample ancestor data - would be populated from database */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Mary Smith
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1845
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Georgia
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Great-Great-Grandmother
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      John Johnson
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1832
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      South Carolina
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Great-Great-Grandfather
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Sarah Williams
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1851
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Alabama
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Great-Great-Aunt
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Family Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Ancestors</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified Ancestors</span>
                <span className="font-bold">16</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Generations</span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Earliest Record</span>
                <span className="font-bold">1832</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Primary Location</span>
                <span className="font-bold">Georgia</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Slave Record Matches</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blockchain Verification</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary bg-opacity-10 rounded-lg p-6 border border-primary">
            <h2 className="text-xl font-bold mb-4">Research Tools</h2>
            <p className="text-gray-700 mb-4">
              Enhance your genealogy research with these tools to explore your ancestry further.
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Historical Records
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Find Slave Records
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Find Possible Relatives
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Historical Photos
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Ancestry Report
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
