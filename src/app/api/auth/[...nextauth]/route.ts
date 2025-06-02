import { authOptions } from '@/auth';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

// Use a simpler configuration to avoid JWT errors
const handler = async (req) => {
  try {
    return await NextAuth(req, authOptions);
  } catch (error) {
    // Added logging for error debugging
    console.error('Auth API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export { handler as GET, handler as POST };
