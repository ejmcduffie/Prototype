@echo off
setlocal enabledelayedexpansion

set "SERVER=209.46.122.165"
set "LOCAL_DIR=%~dp0"
set "REMOTE_DIR=/root/ancestrychain"

echo ===== Starting Migration to %SERVER% =====
echo This will:
echo 1. Install Docker and Docker Compose
echo 2. Back up the existing website
echo 3. Set up containers for both websites
echo 4. Start all services

echo.
echo [%TIME%] 1. Transferring migration files...
scp "%LOCAL_DIR%automate_migration.sh" root@%SERVER%:/root/

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to transfer migration files
    pause
    exit /b 1
)

echo.
echo [%TIME%] 2. Making script executable and starting migration...
ssh root@%SERVER% "chmod +x /root/automate_migration.sh && /root/automate_migration.sh"

if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Migration script failed
    echo [%TIME%] Check the logs on the server for details
    pause
    exit /b 1
)

echo.
echo ===== Migration Complete! =====
echo.
echo Your websites should now be accessible at:
echo - Existing website: http://%SERVER%
echo - AncestryChain:    http://%SERVER%:8080
echo.
echo To monitor the logs:
echo ssh root@%SERVER% "docker compose -f /root/ancestrychain/docker-compose-with-existing-site.yml logs -f"
echo.
pause
