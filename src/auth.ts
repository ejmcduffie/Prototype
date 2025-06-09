import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        // Store provider info in the token
        token.provider = account.provider
        token.accessToken = account.access_token
        
        // Sync user data to Supabase
        const { data: userData, error } = await supabase
          .from('users')
          .upsert(
            {
              id: token.sub,
              email: profile.email,
              name: profile.name,
              image: profile.picture || profile.image,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          )
          
        if (error) {
          console.error('Error syncing user to Supabase:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send required properties to the client
      if (session.user) {
        session.user.id = token.sub!
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // You can add additional sign-in logic here
      // For example, restrict sign-in to specific email domains
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error', // Make sure this matches your error page
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
})

// Export auth function for middleware
export { auth as middleware }