#!/bin/bash
# AncestryChain Recovery Script v2
echo "===== STARTING RECOVERY PROCESS ====="

# 1. System preparation
echo "Step 1: Installing dependencies..."
sudo apt update
sudo apt install -y docker-compose-plugin docker-compose certbot python3-certbot-nginx

# 2. Verify installations
echo "Step 2: Verifying installations..."
docker --version
docker-compose --version  # Using docker-compose explicitly
certbot --version || echo "Certbot not installed"

# 3. Clean environment
echo "Step 3: Cleaning Docker environment..."
cd ~/ancestrychain
docker-compose down -v
docker system prune -af --volumes

# 4. Rebuild containers
echo "Step 4: Rebuilding containers..."
docker-compose up -d --build --force-recreate

# 5. Verify status
echo "Step 5: Verifying deployment status..."
sleep 10
docker ps -a  # Simplified container status
curl -Is http://localhost:3000 | head -1

echo "===== RECOVERY PROCESS COMPLETE ====="