#!/bin/bash
set -e  # Exit on error

echo "===== Rebuilding Application ====="

# Navigate to project directory
cd /root/AncestryChain

# Clean up any existing containers
echo "Cleaning up any existing containers..."
docker compose down || true

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
if ! npm run build; then
    echo "Build failed. Here are the last 100 lines of the build output:"
    npm run build | tail -n 100
    exit 1
fi

# Start the services
echo "Starting services..."
docker compose build --no-cache
docker compose up -d

echo "===== Rebuild Complete ====="
echo "Check the logs with: docker compose logs -f app"
