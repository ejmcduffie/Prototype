import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/signup', '/auth/error'];

// List of protected paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/api'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Allow public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Handle API routes
    if (pathname.startsWith('/api')) {
      // Add CORS headers for API routes
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // For protected paths, the withAuth middleware will handle redirection
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true if the request is authorized
      authorized: ({ req, token }) => {
        const { pathname } = new URL(req.url);
        
        // Allow public paths
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }
        
        // Require authentication for protected paths
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          return !!token;
        }
        
        // Default to allowing access to other paths
        return true;
      },
    },
    pages: {
      signIn: '/login', // Custom sign-in page
      error: '/auth/error', // Error page for auth errors
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
