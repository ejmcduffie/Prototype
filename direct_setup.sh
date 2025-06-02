#!/bin/bash

# Set error handling
set -e

# Create log file
LOG_FILE="/root/setup_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Starting AncestryChain Direct Setup ==="
echo "Logging to $LOG_FILE"

# Function to handle errors
error_exit() {
    echo "ERROR: $1" >&2
    echo "Check $LOG_FILE for details."
    exit 1
}

# Function to check and install package
install_package() {
    local pkg=$1
    echo "Checking $pkg..."
    if ! dpkg -l | grep -q "^ii.*$pkg "; then
        echo "Installing $pkg..."
        apt-get install -y "$pkg" || error_exit "Failed to install $pkg"
    fi
}

# Update system
echo "=== Updating system packages ==="
apt-get update || error_exit "Failed to update package lists"
apt-get upgrade -y || echo "Warning: Package upgrade failed, but continuing..."

# Install required system packages
for pkg in curl wget gnupg2 ca-certificates; do
    install_package "$pkg"
done

# Install Node.js 18.x
echo "=== Installing Node.js 18 ==="
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || error_exit "Failed to set up NodeSource"
    apt-get install -y nodejs || error_exit "Failed to install Node.js"
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install PM2 globally
echo "=== Installing PM2 ==="
npm install -g pm2 || error_exit "Failed to install PM2"

# Install MongoDB
echo "=== Installing MongoDB ==="
if ! systemctl is-active --quiet mongod; then
    if [ ! -f /etc/apt/sources.list.d/mongodb-org-6.0.list ]; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - || error_exit "Failed to add MongoDB key"
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        apt-get update
    fi
    apt-get install -y mongodb-org || error_exit "Failed to install MongoDB"
    systemctl start mongod
    systemctl enable mongod || echo "Warning: Could not enable MongoDB to start on boot"
fi

# Install Redis
echo "=== Installing Redis ==="
if ! systemctl is-active --quiet redis-server; then
    install_package "redis-server"
    systemctl start redis-server
    systemctl enable redis-server || echo "Warning: Could not enable Redis to start on boot"
fi

# Go to application directory
APP_DIR="/root/AncestryChain"
cd "$APP_DIR" || error_exit "Could not find application directory at $APP_DIR"

# Install application dependencies
echo "=== Installing application dependencies ==="
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-optional || error_exit "Failed to install dependencies"

# Fix potential permission issues
chown -R $USER:$USER "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Build the application
echo "=== Building the application ==="
npm run build || error_exit "Build failed"

# Configure Nginx
echo "=== Configuring Nginx ==="
install_package "nginx"

# Create Nginx config if it doesn't exist
NGINX_CONFIG="/etc/nginx/sites-available/ancestrychain"
if [ ! -f "$NGINX_CONFIG" ]; then
    cat > "$NGINX_CONFIG" <<EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx || echo "Warning: Nginx configuration test failed"
fi

# Start the application with PM2
echo "=== Starting application with PM2 ==="
pm2 delete ancestrychain 2>/dev/null || true
cd "$APP_DIR"
NODE_ENV=production pm2 start npm --name "ancestrychain" -- start || error_exit "Failed to start application with PM2"

# Save PM2 process list and set up startup script
pm2 save
pm2 startup 2>/dev/null || echo "PM2 startup already configured"
pm2 save

# Show final status
echo -e "\n=== Final Status ==="
echo -e "\nApplication Status:"
pm2 list

echo -e "\nMongoDB Status:"
systemctl is-active mongod && echo "MongoDB is running" || echo "MongoDB is NOT running"

echo -e "\nRedis Status:"
systemctl is-active redis-server && echo "Redis is running" || echo "Redis is NOT running"

echo -e "\nNginx Status:"
systemctl is-active nginx && echo "Nginx is running" || echo "Nginx is NOT running"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo -e "\n=== Setup Complete! ==="
echo "Your application should be accessible at:"
echo "http://$PUBLIC_IP"
echo ""
echo "If you have a domain name, configure it to point to this server's IP."
echo "Check the log file for any issues: $LOG_FILE"
