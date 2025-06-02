@echo off
setlocal enabledelayedexpansion

echo =============================================
echo    AncestryChain VPS Setup Script
echo    This will set up the application directly
echo    on the VPS without Docker.
echo =============================================
echo.

set "VPS_IP=74.208.160.198"
set "SCRIPT_DIR=D:\Website demos\ancestrychain"
set "SETUP_SCRIPT=direct_setup.sh"
set "LOG_FILE=setup_%DATE:/=-%_%TIME::=-%.log"
set "LOG_FILE=!LOG_FILE: =0!"

echo [%TIME%] Starting setup process...
echo [%TIME%] Logging to %SCRIPT_DIR%\%LOG_FILE%

:transfer_script
echo [%TIME%] 1. Transferring setup script to VPS...
scp "%SCRIPT_DIR%\%SETUP_SCRIPT%" "root@%VPS_IP%:/root/"
if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to transfer script to VPS
    echo [%TIME%] Please check your SSH connection and try again
    pause
    exit /b 1
)

:run_setup
echo [%TIME%] 2. Running setup script on VPS...
echo [%TIME%] This will take 5-10 minutes. Please be patient...

ssh root@%VPS_IP% "chmod +x /root/%SETUP_SCRIPT% && nohup /root/%SETUP_SCRIPT% > /root/setup_output.log 2>&1 &"
if %ERRORLEVEL% neq 0 (
    echo [%TIME%] ERROR: Failed to start setup script on VPS
    echo [%TIME%] Please check your SSH connection and try again
    pause
    exit /b 1
)

echo [%TIME%] 3. Setup is running in the background on the VPS.
echo [%TIME%] You can check the progress with these commands:
echo.
echo     ssh root@%VPS_IP% "tail -f /root/setup_output.log"
echo.
echo [%TIME%] Or to see the PM2 logs:
echo.
echo     ssh root@%VPS_IP% "pm2 logs ancestrychain"
echo.
echo [%TIME%] The application will be accessible at: http://%VPS_IP%
echo.
echo =============================================
echo    Setup is running in the background.
echo    Check the logs for progress.
echo    The application will be available at:
echo    http://%VPS_IP%
echo =============================================

:end
endlocal
pause
