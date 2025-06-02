import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About AncestryChain</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              AncestryChain was founded with a mission to connect African American descendants to their ancestral roots through verified United States slave records, utilizing the power of blockchain technology for secure and immutable verification.
            </p>
            <p className="text-gray-700 mb-4">
              Our platform bridges the gap between historical documentation and modern technology, providing a trustworthy means for individuals to discover and confirm their genealogical connections to ancestors who were enslaved in the United States.
            </p>
            <p className="text-gray-700">
              By leveraging Chainlink's decentralized oracle technology, we ensure that genealogical data is verified against historical records with transparency, security, and accuracy that traditional methods cannot achieve.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How AncestryChain Works</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Document Uploading</h3>
                <p className="text-gray-700">
                  Users upload their GEDCOM files or other genealogical documents containing family history information. Our system securely stores these files in a MongoDB database, specifically in the fileUploads collection, ensuring your data is protected.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Data Extraction</h3>
                <p className="text-gray-700">
                  Our advanced algorithms extract relevant information from your uploaded documents, including names, birth dates, locations, and family relationships.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Blockchain Verification</h3>
                <p className="text-gray-700">
                  Using Chainlink technology, we securely access verified United States slave record databases. Our system matches your family data against these records to identify potential ancestral connections.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Smart Contract Validation</h3>
                <p className="text-gray-700">
                  When a match is found, our smart contracts create a permanent, tamper-proof record of the verification on the blockchain. This ensures that your ancestral connections are documented with the highest level of security and reliability.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">NFT Minting</h3>
                <p className="text-gray-700">
                  For verified documents, you can mint an NFT (Non-Fungible Token) that serves as a digital certificate of authenticity. This NFT contains all verification details and can be shared or transferred while maintaining the document's provenance.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Family Tree Integration</h3>
                <p className="text-gray-700">
                  Verified ancestral connections are integrated into your family tree visualization. This allows you to explore your genealogy with confidence in the accuracy of the information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">AncestryChain vs. Traditional Genealogy Platforms</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AncestryChain</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ancestry.com</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FamilySearch</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Document Verification</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">Blockchain-verified</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Traditional</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Traditional</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Data Immutability</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">Guaranteed</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Not guaranteed</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Not guaranteed</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Ownership of Records</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">User-owned (NFTs)</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Platform-controlled</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Community-shared</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Reward System</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">Earn rewards for verifications</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">None</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">None</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Payment Options</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">Crypto & Traditional</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Traditional only</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">Free (donation-based)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">Focus on Slave Records</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-600">Specialized</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">General</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">General</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">How Blockchain Makes Documents Better</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">What Is Blockchain?</h3>
                <p className="text-gray-700">
                  Think of blockchain like a super-strong digital safe that keeps your important papers safe forever. Once you put your document in this safe, no one can change it or steal it.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Benefits for Genealogy Research</h3>
                <div className="space-y-3 mt-3">
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">Permanent Preservation:</span>
                      <p className="text-gray-700">When you verify your document on blockchain, it stays there forever. It's like having a copy that will never fade, tear, or disappear. Even if the office that gave you the paper closes down, your document is still safe.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">Global Accessibility:</span>
                      <p className="text-gray-700">With blockchain, people anywhere can check that your documents are real without calling lots of different offices. This is especially valuable for international genealogy research.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">Single Verification:</span>
                      <p className="text-gray-700">You only need to verify a document once. Then everyone can see it's real without you having to do it again. No more redundant verification processes.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">Fraud Prevention:</span>
                      <p className="text-gray-700">Blockchain makes it super hard for someone to make fake copies of your documents. This ensures the integrity of your genealogical records.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">Reward System:</span>
                      <p className="text-gray-700">Every time someone uses the system to check a document you already verified, you might earn a small amount of money. It's like getting paid for helping make the system work better.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Our Team</h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">JD</span>
                </div>
                <h3 className="font-semibold text-lg">Dr. John Doe</h3>
                <p className="text-gray-600">Founder & CEO</p>
                <p className="text-gray-600 text-sm mt-2">
                  Historian specializing in African American genealogy with 15+ years of experience.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">JS</span>
                </div>
                <h3 className="font-semibold text-lg">Jane Smith</h3>
                <p className="text-gray-600">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm mt-2">
                  Blockchain specialist with expertise in Chainlink and smart contract development.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">MJ</span>
                </div>
                <h3 className="font-semibold text-lg">Dr. Michael Johnson</h3>
                <p className="text-gray-600">Research Director</p>
                <p className="text-gray-600 text-sm mt-2">
                  Historical archivist with focus on U.S. slave records and documentation.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/contact" className="btn-primary block text-center">
                Contact Our Team
              </Link>
            </div>
          </div>
          
          <div className="bg-primary bg-opacity-10 rounded-lg p-6 border border-primary">
            <h2 className="text-xl font-bold mb-4">Our Partners</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="bg-primary rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>U.S. National Archives</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Chainlink Foundation</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>African American Historical Society</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Genealogy Research Institute</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Webtrees Foundation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Our Commitment to Privacy and Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Data Privacy</h3>
            <p className="text-gray-700 mb-3">
              We understand the sensitive nature of genealogical data and are committed to protecting your privacy.
              All uploaded documents are stored securely, and we never share your personal information with third parties
              without your explicit consent.
            </p>
            <Link href="/privacy" className="text-primary hover:underline font-medium">
              Read our privacy policy
            </Link>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Blockchain Security</h3>
            <p className="text-gray-700 mb-3">
              Our use of blockchain technology ensures that verification records cannot be altered or tampered with,
              providing you with the highest level of security and confidence in your genealogical connections.
            </p>
            <Link href="/terms" className="text-primary hover:underline font-medium">
              View our terms of service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
