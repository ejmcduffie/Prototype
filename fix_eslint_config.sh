#!/bin/bash
echo "Fixing ESLint configuration..."

# Create a temporary file with the new ESLint config
cat > /tmp/.eslintrc.json << 'EOL'
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/no-unescaped-entities": "off",
    "import/no-anonymous-default-export": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOL

# Move the new config to the project directory
mv /tmp/.eslintrc.json /root/AncestryChain/.eslintrc.json

echo "ESLint configuration updated successfully."

# Install required ESLint dependencies
echo "Installing ESLint dependencies..."
cd /root/AncestryChain && npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

echo "ESLint setup complete."
