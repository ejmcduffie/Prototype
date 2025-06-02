#!/bin/bash
echo "Updating dependencies..."

# Update package.json with correct dependencies
cat > /root/AncestryChain/package.json << 'EOL'
{
  "name": "ancestry-chain",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.15",
    "axios": "^1.5.0",
    "bcryptjs": "^3.0.2",
    "ethers": "^6.7.1",
    "mongodb": "^5.7.0",
    "mongoose": "^7.4.3",
    "next": "^14.0.0",
    "next-auth": "^4.23.1",
    "postcss": "^8.4.29",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^4.11.0",
    "resend": "^4.5.1",
    "tailwindcss": "^3.3.3",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.6.0",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "typescript": "^5.3.3"
  }
}
EOL

echo "Installing dependencies..."
cd /root/AncestryChain && npm install --legacy-peer-deps

echo "Dependencies updated successfully."
