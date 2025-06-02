@echo off
setlocal enabledelayedexpansion

set "NEW_SERVER=209.46.122.165"
set "LOCAL_DIR=D:\\Website demos\\ancestrychain"
set "REMOTE_DIR=/root/ancestrychain"

echo ===== Deploying to New Server %NEW_SERVER% =====
echo This will:
echo 1. Install Docker and Docker Compose
echo 2. Copy application files
echo 3. Start the application

echo.
echo [%TIME%] 1. Transferring Docker installation script...
scp "%LOCAL_DIR%\install_docker.sh" root@%NEW_SERVER%:/root/

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to transfer Docker installation script
    pause
    exit /b 1
)

echo.
echo [%TIME%] 2. Installing Docker on the new server...
ssh root@%NEW_SERVER% "chmod +x /root/install_docker.sh && /root/install_docker.sh"

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Docker installation failed
    pause
    exit /b 1
)

echo.
echo [%TIME%] 3. Creating remote directory...
ssh root@%NEW_SERVER% "mkdir -p %REMOTE_DIR%"

echo.
echo [%TIME%] 4. Transferring application files...
scp -r "%LOCAL_DIR%\*" root@%NEW_SERVER%:%REMOTE_DIR%/

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to transfer application files
    pause
    exit /b 1
)

echo.
echo [%TIME%] 5. Starting application with Docker Compose...
ssh root@%NEW_SERVER% "cd %REMOTE_DIR% && docker compose up -d --build"

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] WARNING: Docker Compose encountered an error. Checking status...
    ssh root@%NEW_SERVER% "cd %REMOTE_DIR% && docker compose ps"
    pause
    exit /b 1
)

echo.
echo [%TIME%] 6. Verifying services...
ssh root@%NEW_SERVER% "cd %REMOTE_DIR% && docker compose ps"

echo.
echo ===== Deployment Complete! =====
echo.
echo Your application should be accessible at:
echo http://%NEW_SERVER%
echo.
echo To check the logs:
echo ssh root@%NEW_SERVER% "cd %REMOTE_DIR% && docker compose logs -f"
echo.
echo To restart the application:
echo ssh root@%NEW_SERVER% "cd %REMOTE_DIR% && docker compose restart"
echo.
pause
