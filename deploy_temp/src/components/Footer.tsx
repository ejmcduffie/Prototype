"use client";

import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary-dark text-secondary-light py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">AncestryChain</h3>
            <p className="mb-4">
              Verify United States slave records and connect descendants to their ancestry using blockchain technology.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-primary transition-colors duration-200">
                  Upload
                </Link>
              </li>
              <li>
                <Link href="/genealogy" className="hover:text-primary transition-colors duration-200">
                  Genealogy
                </Link>
              </li>
              <li>
                <Link href="/verification" className="hover:text-primary transition-colors duration-200">
                  Verification
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} AncestryChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
