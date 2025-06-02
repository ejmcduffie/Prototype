#!/bin/bash
echo "Fixing NextAuth route handler..."

cat > /root/AncestryChain/src/app/api/auth/\[...nextauth\]/route.ts << 'EOL'
import { authOptions } from '@/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
EOL

echo "NextAuth route handler fixed successfully."
