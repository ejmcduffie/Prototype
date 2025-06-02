import { authOptions } from '@/auth';
import NextAuth from 'next-auth';

// Use a simpler configuration to avoid JWT errors
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
