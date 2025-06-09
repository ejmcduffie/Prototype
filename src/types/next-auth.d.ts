import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's internal UUID */
      id: string;
      /** The user's name */
      name?: string | null;
      /** The user's email */
      email?: string | null;
      /** The user's image/avatar URL */
      image?: string | null;
      /** The user's provider ID (e.g., Google sub) */
      providerId?: string;
    } & DefaultSession['user'];
    
    /** Access token for Supabase */
    accessToken?: string;
  }

  /**
   * Extend the built-in user types
   */
  interface User extends DefaultUser {
    /** The user's provider ID (e.g., Google sub) */
    providerId?: string;
  }

  /**
   * Extend the built-in profile types
   */
  interface Profile {
    /** User's profile picture URL */
    picture?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT extends DefaultJWT {
    /** The user's provider ID */
    providerId?: string;
    /** The access token from the provider */
    accessToken?: string;
    /** The provider name (e.g., 'google') */
    provider?: string;
    /** User ID from the database */
    sub?: string;
  }
}