#!/bin/bash
# AncestryChain Recovery Script v3
echo "===== STARTING RECOVERY PROCESS ====="

# 1. System preparation
echo "Step 1: Installing Docker and dependencies..."
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Verify installations
echo "Step 2: Verifying installations..."
docker --version
docker-compose --version
certbot --version

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
docker ps -a
curl -Is http://localhost:3000 | head -1

echo "===== RECOVERY PROCESS COMPLETE ====="