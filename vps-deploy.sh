#!/bin/bash

# Exit on any error
set -e

# Load environment variables
source .env

# Pull the latest changes (if using version control)
# git pull

# Build and start the containers
echo "🚀 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations if needed
# echo "🔄 Running migrations..."
# docker-compose -f docker-compose.prod.yml exec app npm run migrate

echo "✅ Deployment complete!"
echo "🌐 Your application is running at: http://localhost:3000"
