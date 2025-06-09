// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authOptions: NextAuthOptions = {
  providers: [
    // Add your authentication providers here
    // For Supabase, we'll use the built-in JWT strategy
  ],
  callbacks: {
    async session({ session, token }) {
      session.supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.supabaseAccessToken = account.access_token;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};