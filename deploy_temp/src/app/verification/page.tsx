import React from 'react';
import Link from 'next/link';

export default function Verification() {
  // Sample verification data - would be populated from blockchain in a real implementation
  const verificationData = {
    status: 'Verified',
    timestamp: '2025-05-25T14:32:10Z',
    blockchainNetwork: 'Polygon Testnet',
    transactionHash: '0x3a8d9b2c7d6e5f4a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d',
    contractAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blockchain Verification</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold mb-2">How Verification Works</h2>
          <p className="text-gray-700">
            AncestryChain uses Chainlink technology to verify your genealogy data against
            historical United States slave records. Our blockchain verification system ensures
            the authenticity and integrity of your ancestral connections.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Verification Process</h3>
            <ol className="space-y-4">
              <li className="flex">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-secondary-dark font-bold mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Upload Family Records</h4>
                  <p className="text-gray-600 text-sm">
                    Upload your GEDCOM file or historical family documents.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-secondary-dark font-bold mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Data Extraction</h4>
                  <p className="text-gray-600 text-sm">
                    Our system extracts relevant names, dates, and locations from your records.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-secondary-dark font-bold mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Blockchain Oracle Request</h4>
                  <p className="text-gray-600 text-sm">
                    Chainlink functions fetch and verify data from U.S. slave records databases.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-secondary-dark font-bold mr-3 flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Smart Contract Verification</h4>
                  <p className="text-gray-600 text-sm">
                    Records are verified through a smart contract that validates and stores the proof.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-secondary-dark font-bold mr-3 flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-semibold">Results & Documentation</h4>
                  <p className="text-gray-600 text-sm">
                    Receive blockchain-verified documentation of your ancestral connections.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Benefits of Blockchain Verification</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary text-secondary-dark p-1 rounded-full mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>
                  <span className="font-semibold">Immutability:</span>{" "}
                  <span className="text-gray-600">Once verified, records cannot be altered or tampered with.</span>
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-secondary-dark p-1 rounded-full mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>
                  <span className="font-semibold">Transparency:</span>{" "}
                  <span className="text-gray-600">All verification steps are publicly viewable on the blockchain.</span>
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-secondary-dark p-1 rounded-full mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>
                  <span className="font-semibold">Trust:</span>{" "}
                  <span className="text-gray-600">Third-party verification eliminates the need to trust any single entity.</span>
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-secondary-dark p-1 rounded-full mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>
                  <span className="font-semibold">Permanence:</span>{" "}
                  <span className="text-gray-600">Records remain accessible indefinitely for future generations.</span>
                </p>
              </li>
              <li className="flex items-start">
                <div className="bg-primary text-secondary-dark p-1 rounded-full mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>
                  <span className="font-semibold">Legal Standing:</span>{" "}
                  <span className="text-gray-600">Blockchain verification provides stronger legal documentation.</span>
                </p>
              </li>
            </ul>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Start Your Verification</h3>
              <p className="text-gray-600 mb-4">
                Begin the process by uploading your family records for verification.
              </p>
              <Link href="/upload" className="btn-primary inline-block">
                Upload Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Verification</h2>
        
        {verificationData ? (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-green-700">Verification Successful</span>
              </div>
              <p className="text-green-600">
                Your records have been successfully verified on the blockchain.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Verification Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Status:</div>
                    <div className="font-medium">{verificationData.status}</div>
                    
                    <div className="text-gray-600">Timestamp:</div>
                    <div className="font-medium">{new Date(verificationData.timestamp).toLocaleString()}</div>
                    
                    <div className="text-gray-600">Blockchain:</div>
                    <div className="font-medium">{verificationData.blockchainNetwork}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Transaction Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-2">
                    <div className="text-gray-600 text-sm">Transaction Hash:</div>
                    <div className="font-mono text-xs break-all">{verificationData.transactionHash}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Contract Address:</div>
                    <div className="font-mono text-xs break-all">{verificationData.contractAddress}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary bg-opacity-10 rounded-lg p-4 border border-primary">
              <h3 className="font-semibold mb-2">Verified Ancestry</h3>
              <p className="text-gray-700 mb-3">
                Our blockchain verification has confirmed connections to the following historical records:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>Smith Plantation Records (Georgia, 1845-1860)</li>
                <li>Johnson Family Slave Registry (South Carolina, 1830-1865)</li>
                <li>Alabama Emancipation Documents (1865-1870)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No Verification Data Available</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any documents for verification yet.
            </p>
            <Link href="/upload" className="btn-primary">
              Upload Documents
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Verification Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Uploads</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Records</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Verification</span>
              <span className="font-bold">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verification Rate</span>
              <span className="font-bold">67%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Download Verification</h3>
          <p className="text-gray-600 mb-4">
            Download your verification certificate and documentation for your records.
          </p>
          <button className="bg-primary text-secondary-dark font-bold py-2 px-4 rounded shadow-button w-full mb-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Certificate (PDF)
          </button>
          <button className="bg-secondary-light text-secondary-dark border border-gray-300 font-bold py-2 px-4 rounded shadow-sm w-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Export Blockchain Proof
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Verification Support</h3>
          <p className="text-gray-600 mb-4">
            Need help with the verification process? Our team is available to assist you.
          </p>
          <div className="space-y-3">
            <a href="#" className="flex items-center text-primary hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verification FAQs
            </a>
            <a href="#" className="flex items-center text-primary hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Verification Guide
            </a>
            <Link href="/contact" className="flex items-center text-primary hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
