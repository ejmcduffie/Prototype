"use client";

import React from 'react';
import Link from 'next/link';
import FileUploadForm from '@/components/upload/FileUploadForm';

export default function Upload() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Your Family Records</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FileUploadForm 
            fileCategory="All"
            allowedExtensions={[".ged", ".pdf", ".jpg", ".jpeg", ".png", ".mp3", ".mp4", ".txt", ".csv"]}
            maxSizeMB={25}
            title="Upload Family Records"
            description="Upload genealogy files, documents, photos, audio or video"
          />
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Supported File Types</h2>
            <ul className="space-y-2">
              <li>• GEDCOM files (.ged)</li>
              <li>• Documents (.pdf, .txt)</li>
              <li>• Images (.jpg, .jpeg, .png)</li>
              <li>• Audio (.mp3)</li>
              <li>• Video (.mp4)</li>
              <li>• DNA Data (.csv)</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How Verification Works</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 mr-3 text-secondary-dark">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Upload Your Records</h3>
                  <p className="text-sm text-gray-600">Upload your GEDCOM file or other documents containing your family history.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 mr-3 text-secondary-dark">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Processing</h3>
                  <p className="text-sm text-gray-600">Your data is securely processed using our blockchain technology.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 mr-3 text-secondary-dark">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Record Matching</h3>
                  <p className="text-sm text-gray-600">We match your family data against verified U.S. slave records.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 mr-3 text-secondary-dark">
                  <span className="font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold">Blockchain Verification</h3>
                  <p className="text-sm text-gray-600">Using Chainlink technology to verify data authenticity and create immutable records.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-2 mr-3 text-secondary-dark">
                  <span className="font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold">Results</h3>
                  <p className="text-sm text-gray-600">Receive verified documentation of your ancestral connections.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary bg-opacity-10 rounded-lg p-6 border border-primary">
            <h2 className="text-xl font-bold mb-4">Need Help?</h2>
            <p className="text-gray-700 mb-4">
              Having trouble with your upload or have questions about the verification process?
              Our team is here to help you trace your ancestry.
            </p>
            <Link href="/contact" className="btn-primary block text-center">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
