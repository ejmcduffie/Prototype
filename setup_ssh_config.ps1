# PowerShell script to set up SSH config with keepalive settings
$sshFolder = "$env:USERPROFILE\.ssh"
$configFile = "$sshFolder\config"

# Create .ssh directory if it doesn't exist
if (!(Test-Path $sshFolder)) {
    New-Item -ItemType Directory -Path $sshFolder
    Write-Host "Created .ssh directory"
}

# Append keepalive settings to config file
$configContent = @"

# Added for VPS at 209.46.122.165
Host 209.46.122.165
    HostName 209.46.122.165
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

if ($existingConfig -notmatch "209.46.122.165") {
    Add-Content -Path $configFile -Value $configContent
    Write-Host "Added keepalive settings to SSH config"
} else {
    Write-Host "SSH config already contains settings for 209.46.122.165"
}

Write-Host "SSH configuration updated successfully!"
