"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

const Header = () => {
  const pathname = usePathname();
  // Add status to handle loading state gracefully
  const { data: session, status } = useSession();

  const isActive = (path: string) => {
    return pathname === path ? 'nav-link-active' : 'nav-link';
  };

  return (
    <header className="bg-secondary-light shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">AncestryChain</span>
            </Link>
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link href="/" className={isActive('/')}>
              Home
            </Link>
            <Link href="/about" className={isActive('/about')}>
              About
            </Link>
            <Link href="/dashboard" className={isActive('/dashboard')}>
              Dashboard
            </Link>
            <Link href="/upload" className={isActive('/upload')}>
              Upload
            </Link>
            <Link href="/genealogy" className={isActive('/genealogy')}>
              Genealogy
            </Link>
            <Link href="/verification" className={isActive('/verification')}>
              Verification
            </Link>
            <Link href="/contact" className={isActive('/contact')}>
              Contact
            </Link>
            
            {status === 'loading' ? (
              <span className="px-4 py-2 ml-2">Loading...</span>
            ) : status === 'authenticated' ? (
              <div className="flex items-center space-x-2 ml-2">
                <span>Welcome, {session?.user?.name || session?.user?.email}</span>
                <button 
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 ml-2"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
