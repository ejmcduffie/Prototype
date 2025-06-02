@echo off
REM AncestryChain Deployment Helper
REM This script uploads and executes the deployment script on the server

echo ===== AncestryChain Deployment =====
echo Uploading and executing deployment script on server...

REM Upload the deployment script to the server
scp "%~dp0plesk_deploy.sh" root@209.46.122.165:/tmp/plesk_deploy.sh

REM Make the script executable and run it
ssh root@209.46.122.165 "chmod +x /tmp/plesk_deploy.sh && /tmp/plesk_deploy.sh"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Deployment failed!
    exit /b %ERRORLEVEL%
)

echo Deployment script executed successfully!
echo You can view the logs in /var/log/ancestrychain/ on the server
