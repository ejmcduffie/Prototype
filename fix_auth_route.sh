#!/bin/bash
# Fix the NextAuth route handler
echo "Fixing NextAuth route handler..."

cat > /root/AncestryChain/src/app/api/auth/\[...nextauth\]/route.ts << 'EOL'
import NextAuth from 'next-auth';
import { authOptions } from '@/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
EOL

echo "NextAuth route handler fixed successfully."
