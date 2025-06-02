#!/bin/bash

# Configuration
BACKUP_DIR="/root/website_backup_$(date +%Y%m%d_%H%M%S)"
NGINX_CONF="/etc/nginx/sites-available/default"

# Create backup directory
echo "Creating backup directory at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Backup Nginx configuration
if [ -f "$NGINX_CONF" ]; then
    echo "Backing up Nginx configuration..."
    cp "$NGINX_CONF" "$BACKUP_DIR/"
fi

# Backup website files
echo "Backing up website files from /var/www/html..."
if [ -d "/var/www/html" ]; then
    cp -r /var/www/html "$BACKUP_DIR/"
fi

# Get database information if using MySQL/MariaDB
if command -v mysql &> /dev/null; then
    echo "Backing up MySQL databases..."
    mkdir -p "$BACKUP_DIR/mysql"
    mysqldump --all-databases > "$BACKUP_DIR/mysql/all_databases.sql" 2>/dev/null || echo "No MySQL databases found or access denied"
fi

# Get database information if using PostgreSQL
if command -v pg_dump &> /dev/null; then
    echo "Backing up PostgreSQL databases..."
    mkdir -p "$BACKUP_DIR/postgresql"
    sudo -u postgres pg_dumpall > "$BACKUP_DIR/postgresql/all_databases.sql" 2>/dev/null || echo "No PostgreSQL databases found or access denied"
fi

echo "Backup completed. Files saved to: $BACKUP_DIR"

# Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOL'
#!/bin/bash
# Restore script for website

# Restore Nginx configuration
if [ -f "default" ]; then
    echo "Restoring Nginx configuration..."
    sudo cp default /etc/nginx/sites-available/
    sudo nginx -t && sudo systemctl restart nginx
fi

# Restore website files
if [ -d "html" ]; then
    echo "Restoring website files..."
    sudo rm -rf /var/www/html/*
    sudo cp -r html/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
fi

# Restore MySQL databases if backup exists
if [ -f "mysql/all_databases.sql" ]; then
    echo "Restoring MySQL databases..."
    mysql < mysql/all_databases.sql
fi

# Restore PostgreSQL databases if backup exists
if [ -f "postgresql/all_databases.sql" ]; then
    echo "Restoring PostgreSQL databases..."
    sudo -u postgres psql -f postgresql/all_databases.sql
fi

echo "Restore completed."
EOL

chmod +x "$BACKUP_DIR/restore.sh"
echo "A restore script has been created at $BACKUP_DIR/restore.sh"
