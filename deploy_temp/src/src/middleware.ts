import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
    error: '/login'
  }
});

export const config = {
  // Make all pages publicly accessible
  // No protected routes
  matcher: []
};
