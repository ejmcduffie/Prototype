import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { dbConnect } from '@/lib/dbconnect';
import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend the JWT type to include user ID
interface ExtendedJWT extends JWT {
  id?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials?.email });
        if (user && credentials?.password && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user._id.toString(), email: user.email, name: user.name };
        }
        return null;
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }: { token: ExtendedJWT, user: any }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: any, token: ExtendedJWT }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' }
};

export default NextAuth(authOptions);
