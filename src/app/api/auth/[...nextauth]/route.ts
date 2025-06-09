import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@auth/supabase-adapter';

// Initialize Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        
        // Sync user data to Supabase (match table schema)
        const { error } = await supabase
          .from('users')
          .upsert(
            {
              id: token.sub, // Google sub as user id
              profile_data: {
                email: profile.email,
                name: profile.name,
                image: profile.picture || profile.image
              },
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );
        if (error) {
          console.error('Error syncing user to Supabase:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };