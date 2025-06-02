#!/bin/bash

# Create necessary directories
echo "Creating directory structure..."
mkdir -p website-nginx/conf website-html website-nginx/certs website-nginx/vhost.d

# Backup existing Nginx configuration
echo "Backing up existing Nginx configuration..."
if [ -f "/etc/nginx/nginx.conf" ]; then
    cp /etc/nginx/nginx.conf website-nginx/
fi

if [ -d "/etc/nginx/conf.d" ]; then
    cp -r /etc/nginx/conf.d/* website-nginx/conf/
fi

# Copy website files
echo "Copying website files..."
if [ -d "/var/www/html" ]; then
    cp -r /var/www/html/* website-html/
fi

# Create a default Nginx configuration if none exists
if [ ! -f "website-nginx/conf/default.conf" ]; then
    cat > website-nginx/conf/default.conf << 'EOL'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
EOL
fi

# Create a script to stop the existing services
echo "Creating service management scripts..."
cat > stop-existing-services.sh << 'EOL'
#!/bin/bash
# Stop and disable existing services to prevent port conflicts
echo "Stopping Nginx..."
systemctl stop nginx
systemctl disable nginx

echo "Stopping any other services that might use ports 80/443..."
systemctl stop apache2 2>/dev/null
systemctl disable apache2 2>/dev/null

echo "Services stopped. You can start them again with start-existing-services.sh"
EOL

cat > start-existing-services.sh << 'EOL'
#!/bin/bash
# Restart the original services if needed
echo "Starting Nginx..."
systemctl enable nginx
systemctl start nginx

echo "Services started."
EOL

chmod +x stop-existing-services.sh start-existing-services.sh

# Create a README file
cat > MIGRATION_README.txt << 'EOL'
MIGRATION INSTRUCTIONS
=====================

1. BACKUP YOUR SERVER
   - Run the backup script: ./backup_existing_site.sh
   - This will create a complete backup in /root/website_backup_*

2. STOP EXISTING SERVICES
   - Run: ./stop-existing-services.sh
   - This will stop Nginx and other services that might conflict with Docker

3. START THE DOCKER STACK
   - Run: docker compose -f docker-compose-with-existing-site.yml up -d
   - This will start both your existing website and AncestryChain

4. ACCESS YOUR SITES
   - Existing website: http://your-server-ip
   - AncestryChain: http://your-server-ip:8080

5. IF SOMETHING GOES WRONG
   - To restore from backup: cd /root/website_backup_* && ./restore.sh
   - To restart original services: ./start-existing-services.sh

6. TO MAKE CHANGES
   - Website files: ./website-html/
   - Nginx config: ./website-nginx/conf/
   - After making changes, run: docker compose -f docker-compose-with-existing-site.yml restart website

7. MONITORING
   - View logs: docker compose -f docker-compose-with-existing-site.yml logs -f
   - Check containers: docker ps

IMPORTANT: Make sure to update any DNS settings if you're using domain names.
EOL

echo "Migration setup complete!"
echo "Please read MIGRATION_README.txt for next steps."
echo "Don't forget to backup your server before making any changes!"
