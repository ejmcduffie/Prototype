@echo off
setlocal enabledelayedexpansion

set "SERVER=209.46.122.165"
set "LOCAL_DIR=%~dp0"
set "REMOTE_DIR=/root/deploy"

echo ===== Starting Fresh Deployment to %SERVER% =====
echo This will:
echo 1. Install Docker and dependencies
echo 2. Clone the repository
echo 3. Set up the application

echo.
echo [%TIME%] 1. Creating remote directory...
ssh root@%SERVER% "mkdir -p %REMOTE_DIR%"

echo.
echo [%TIME%] 2. Transferring deployment script...
scp "%LOCAL_DIR%fresh_deploy.sh" root@%SERVER%:%REMOTE_DIR%/

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to transfer deployment script
    pause
    exit /b 1
)

echo.
echo [%TIME%] 3. Making script executable and starting deployment...
ssh root@%SERVER% "chmod +x %REMOTE_DIR%/fresh_deploy.sh && cd %REMOTE_DIR% && ./fresh_deploy.sh"

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Deployment script failed
    echo [%TIME%] Check the logs on the server for details
    pause
    exit /b 1
)

echo.
echo ===== Deployment Complete! =====
echo.
echo Your application should now be accessible at:
echo http://%SERVER%
echo.
echo To monitor the logs:
echo ssh root@%SERVER% "cd /opt/ancestrychain && docker-compose logs -f"
echo.
pause
