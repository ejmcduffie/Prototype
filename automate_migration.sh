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

section "1. Installing Prerequisites"
# Update package lists
echo "Updating package lists..."
apt-get update || error_exit "Failed to update package lists"

# Install required packages
echo "Installing required packages..."
apt-get install -y curl wget gnupg2 lsb-release || error_exit "Failed to install required packages"

section "2. Installing Docker & Docker Compose"
# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh || error_exit "Failed to download Docker install script"
    sh get-docker.sh || error_exit "Failed to install Docker"
    rm get-docker.sh
else
    echo "Docker is already installed."
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose || \
        error_exit "Failed to download Docker Compose"
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
else
    echo "Docker Compose is already installed."
fi

section "3. Making Scripts Executable"
chmod +x backup_existing_site.sh migrate_existing_site.sh || error_exit "Failed to make scripts executable"

section "4. Backing Up Existing Site"
if [ ! -f "backup_complete.flag" ]; then
    ./backup_existing_site.sh || error_exit "Backup failed"
    touch backup_complete.flag
else
    echo "Backup already completed. Skipping..."
fi

section "5. Preparing Migration"
if [ ! -f "migration_prepared.flag" ]; then
    ./migrate_existing_site.sh || error_exit "Migration preparation failed"
    touch migration_prepared.flag
else
    echo "Migration already prepared. Skipping..."
fi

section "6. Stopping Conflicting Services"
# Stop Nginx if running
if systemctl is-active --quiet nginx; then
    echo "Stopping Nginx..."
    systemctl stop nginx
    systemctl disable nginx
fi

# Stop Apache if running
if systemctl is-active --quiet apache2; then
    echo "Stopping Apache..."
    systemctl stop apache2
    systemctl disable apache2
fi

section "7. Starting Docker Containers"
echo "Starting Docker containers..."
docker compose -f docker-compose-with-existing-site.yml up -d --build || error_exit "Failed to start containers"

section "8. Verifying Services"
echo -e "\n${GREEN}Verifying services...${NC}"
sleep 10  # Give containers time to start

echo -e "\n${YELLOW}=== Container Status ===${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n${YELLOW}=== Service URLs ===${NC}"
PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo -e "Existing Website: ${GREEN}http://${PUBLIC_IP}${NC}"
echo -e "AncestryChain:     ${GREEN}http://${PUBLIC_IP}:8080${NC}"

section "9. Next Steps"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "\n${YELLOW}Important:${NC}"
echo "1. Test both websites to ensure they're working"
echo "2. Check logs if anything is not working:"
echo "   - For existing website: ${GREEN}docker logs existing-website${NC}"
echo "   - For AncestryChain:    ${GREEN}docker logs ancestrychain-app${NC}"
echo "3. Set up monitoring for your containers"
echo "4. Consider setting up HTTPS for both sites"
echo -e "\nBackup location: ${GREEN}/root/website_backup_*${NC}"
