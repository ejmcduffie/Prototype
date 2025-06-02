# PowerShell script to set up SSH and verify Docker
Write-Host "====== AncestryChain Docker Verification Tool ======" -ForegroundColor Cyan

# 1. Set up SSH config with keepalive settings
Write-Host "Setting up SSH configuration..." -ForegroundColor Yellow
$sshFolder = "$env:USERPROFILE\.ssh"
$configFile = "$sshFolder\config"

# Create .ssh directory if it doesn't exist
if (!(Test-Path $sshFolder)) {
    New-Item -ItemType Directory -Path $sshFolder
    Write-Host "Created .ssh directory"
}

# Append keepalive settings to config file
$configContent = @"

# Added for VPS at 74.208.160.198
Host 74.208.160.198
    HostName 74.208.160.198
    User root
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
"@

# Check if the config already has these settings
$existingConfig = ""
if (Test-Path $configFile) {
    $existingConfig = Get-Content $configFile -Raw
}

if ($existingConfig -notmatch "74.208.160.198") {
    Add-Content -Path $configFile -Value $configContent
    Write-Host "Added keepalive settings to SSH config"
} else {
    Write-Host "SSH config already contains settings for 74.208.160.198"
}

# 2. Generate a Docker verification script
Write-Host "Creating Docker verification script..." -ForegroundColor Yellow
$verifyScript = @'
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
'@

# Save the script locally
$verifyScript | Out-File -FilePath "verify_docker.sh" -Encoding utf8

# 3. Upload and execute the script in one command
Write-Host "Uploading and executing the script on your VPS..." -ForegroundColor Yellow
$sshCommand = 'cat > /tmp/verify_docker.sh << "EOL"
' + $verifyScript + '
EOL
chmod +x /tmp/verify_docker.sh
/tmp/verify_docker.sh
'

# Create a temporary file with the SSH command
$tempFile = [System.IO.Path]::GetTempFileName()
$sshCommand | Out-File -FilePath $tempFile -Encoding utf8

# Execute the SSH command using the temp file
Write-Host "Connecting to server and running verification..." -ForegroundColor Green
ssh root@209.46.122.165 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o ConnectTimeout=30 < $tempFile

# Clean up
Remove-Item $tempFile

Write-Host "====== Verification Process Complete ======" -ForegroundColor Cyan
