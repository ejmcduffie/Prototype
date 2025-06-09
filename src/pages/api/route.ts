// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@auth/supabase-adapter';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  // ... rest of your NextAuth config
  providers: [
    // Your authentication providers (Google, GitHub, etc.)
    // Example:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Send properties to the client, like an access_token from a provider
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // ... rest of your NextAuth config
});

export { handler as GET, handler as POST };