#!/bin/bash
# Script to verify and fix Docker installation
echo "===== Docker Verification Script ====="

# Check if Docker is installed
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found, installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    echo "Docker installed successfully."
else
    echo "Docker is installed: $(docker --version)"
fi

# Check Docker service
echo "Checking Docker service..."
if systemctl is-active --quiet docker; then
    echo "Docker service is running"
else
    echo "Docker service is not running, starting it..."
    systemctl start docker
    systemctl enable docker
    echo "Docker service started and enabled."
fi

# Test Docker
echo "Testing Docker with hello-world container..."
docker run --rm hello-world && echo "Docker test successful!" || echo "Docker test failed!"

# Check Docker Compose
echo "Checking Docker Compose..."
if docker compose version &> /dev/null; then
    echo "Docker Compose plugin is installed: $(docker compose version)"
else
    echo "Installing Docker Compose plugin..."
    apt-get update
    apt-get install -y docker-compose-plugin
    echo "Docker Compose plugin installed."
fi

# Verify our project's docker-compose file
echo "Verifying docker-compose.yml..."
if [ -f "/root/AncestryChain/docker-compose.yml" ]; then
    echo "docker-compose.yml exists"
    cd /root/AncestryChain
    docker compose config && echo "docker-compose.yml is valid!" || echo "docker-compose.yml is invalid!"
else
    echo "docker-compose.yml not found in /root/AncestryChain/"
fi

echo "===== Docker Verification Complete ====="
