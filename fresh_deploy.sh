#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
section() {
    echo -e "\n${YELLOW}===== $1 =====${NC}"
}

# Function to handle errors
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    error_exit "This script must be run as root"
fi

section "1. Updating System and Installing Prerequisites"
apt-get update || error_exit "Failed to update package lists"
apt-get upgrade -y
apt-get install -y curl wget git docker.io docker-compose || error_exit "Failed to install required packages"

# Start and enable Docker
systemctl start docker
systemctl enable docker

section "2. Creating Project Directory"
PROJECT_DIR="/opt/ancestrychain"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR" || error_exit "Failed to create/access project directory"

section "3. Cloning Repository"
GIT_REPO="https://github.com/ejmcduffie/ancestrychain.git"
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Repository already exists. Pulling latest changes..."
    git pull || error_exit "Failed to pull latest changes"
else
    git clone "$GIT_REPO" . || error_exit "Failed to clone repository"
fi

section "4. Setting Up Environment"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "\n${YELLOW}Please edit the .env file with your configuration and press Enter to continue...${NC}"
    read -p "Press Enter to continue"
    nano .env
fi

section "5. Building and Starting Containers"
docker-compose build || error_exit "Failed to build containers"
docker-compose up -d || error_exit "Failed to start containers"

section "6. Verifying Services"
sleep 10  # Give containers time to start

echo -e "\n${GREEN}=== Container Status ===${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Your application should be accessible at:"
echo -e "- Main Application: ${GREEN}http://${PUBLIC_IP}${NC}"

echo -e "\n${YELLOW}=== Next Steps ===${NC}"
echo "1. Check application logs: cd $PROJECT_DIR && docker-compose logs -f"
echo "2. Set up a reverse proxy (Nginx/Apache) for HTTPS"
echo "3. Configure monitoring for your services"
echo -e "\n${YELLOW}=== Important Commands ===${NC}"
echo "- Stop services: cd $PROJECT_DIR && docker-compose down"
echo "- View logs: cd $PROJECT_DIR && docker-compose logs -f"
echo "- Restart services: cd $PROJECT_DIR && docker-compose restart"

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
