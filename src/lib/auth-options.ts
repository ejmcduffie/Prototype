import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { supabase } from './supabase';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.error('Credentials provider: Email or password missing');
          return null;
        }
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            console.error('Supabase sign-in error:', authError?.message);
            throw new Error(authError?.message || 'Invalid login credentials');
          }

          const supabaseUser = authData.user;
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', supabaseUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', profileError.message);
          }

          return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: profileData?.username || supabaseUser.user_metadata?.username || supabaseUser.user_metadata?.name || null,
            role: supabaseUser.user_metadata?.role || 'user',
          };
        } catch (error: any) {
          console.error('Authorize error:', error.message);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  events: {
    async signIn(message) {
      if (message.isNewUser) {
        // New user signed up
        const userId = message.user.id;
        const email = message.user.email;
        const name = message.user.name || '';

        // Insert user into public.users table if they don't exist
        const { error } = await supabase
          .from('users')
          .upsert(
            {
              id: userId,
              email: email,
              full_name: name,
              role: 'user',
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Sign in or sign up with Supabase Auth
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: process.env.NEXTAUTH_URL,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Error signing in with Google:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        // Get or create user in your database if needed
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (!error && userData) {
          token.role = userData.role;
        } else {
          // Set default role if user doesn't exist yet
          token.role = 'user';
          
          // Create user in public.users table if they don't exist
          const { error: createError } = await supabase
            .from('users')
            .upsert(
              {
                id: user.id,
                email: user.email,
                full_name: user.name || '',
                role: 'user',
              },
              { onConflict: 'id' }
            );

          if (createError) {
            console.error('Error creating user profile in JWT callback:', createError);
          }
        }

        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// TypeScript module augmentation (keep as is)
declare module 'next-auth' {
  interface User {
    id: string;
    email?: string | null;
    role?: string;
    name?: string | null;
    image?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    name?: string | null;
    email?: string | null;
  }
}