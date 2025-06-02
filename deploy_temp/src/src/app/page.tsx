import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary-dark text-secondary-light py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Verify</span> Your Ancestral Heritage
          </h1>
          <p className="text-xl md:max-w-2xl mx-auto mb-8">
            Connect to your lineage through verified United States slave records using blockchain technology for secure and trustworthy verification.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/upload" className="btn-primary">
              Upload GEDCOM File
            </Link>
            <Link href="/dashboard" className="bg-secondary-light text-secondary-dark font-bold py-2 px-4 rounded shadow-button text-lg transition-all duration-200 hover:bg-gray-100">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="mb-4 text-primary text-4xl">01</div>
              <h3 className="text-xl font-bold mb-2">Upload Records</h3>
              <p>Upload your GEDCOM file or family history records to our secure platform.</p>
            </div>
            <div className="card">
              <div className="mb-4 text-primary text-4xl">02</div>
              <h3 className="text-xl font-bold mb-2">Blockchain Verification</h3>
              <p>Our system uses Chainlink technology to verify your ancestry against historical slave records.</p>
            </div>
            <div className="card">
              <div className="mb-4 text-primary text-4xl">03</div>
              <h3 className="text-xl font-bold mb-2">Discover Your Lineage</h3>
              <p>Receive verified documentation of your ancestral connections and explore your family tree.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Why Choose AncestryChain</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary p-3 rounded-full text-secondary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Verification</h3>
                <p>Using blockchain technology ensures your data is securely verified and tamper-proof.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary p-3 rounded-full text-secondary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Historical Accuracy</h3>
                <p>Access to verified United States slave records ensures accurate lineage tracing.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary p-3 rounded-full text-secondary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Documentation</h3>
                <p>Receive verifiable documentation of your ancestry for legal and historical purposes.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary p-3 rounded-full text-secondary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Family Connection</h3>
                <p>Connect with potential relatives who share your ancestry through our network.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-secondary-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Heritage?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your journey to verify your ancestry and connect with your historical roots today.
          </p>
          <Link href="/upload" className="bg-secondary-dark text-secondary-light font-bold py-3 px-6 rounded-lg shadow-button text-lg transition-all duration-200 hover:bg-gray-800">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
