#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment to VPS..."

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker-compose -f docker-compose.prod.yml build

# Save the Docker image to a tar file
echo "💾 Saving Docker image..."
docker save $(docker-compose -f docker-compose.prod.yml config | yq '.services.app.image' | tr -d '"') -o ancestrychain-prod.tar

# Transfer the Docker image to your VPS
echo "📤 Transferring Docker image to VPS..."
# Replace with your VPS details
VPS_USER=your_vps_username
VPS_HOST=your_vps_ip
VPS_PATH=/path/to/ancestrychain

scp docker-compose.prod.yml .env.local deploy.sh ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
scp ancestrychain-prod.tar ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# SSH into VPS and deploy
echo "🚀 Deploying to VPS..."
ssh ${VPS_USER}@${VPS_HOST} "
    cd ${VPS_PATH} && \
    echo '📦 Loading Docker image...' && \
    docker load -i ancestrychain-prod.tar && \
    echo '🚀 Starting containers...' && \
    docker-compose -f docker-compose.prod.yml up -d --force-recreate && \
    echo '✅ Deployment complete!'
"

echo "✨ Deployment script complete!"
