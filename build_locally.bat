@echo off
echo ===== Building Application Locally on VPS =====

echo This will build the application directly on the VPS without Docker.
echo.

REM Create a build script on the VPS
ssh root@74.208.160.198 "cat > /root/build_app.sh << 'EOL'
#!/bin/bash
set -e
cd /root/AncestryChain

echo "1. Installing dependencies..."
npm install --legacy-peer-deps

echo "2. Building the application..."
npm run build

echo "3. Build completed successfully!"
EOL"

REM Make the script executable and run it
ssh root@74.208.160.198 "chmod +x /root/build_app.sh && /root/build_app.sh"

echo.
echo ===== Build Attempt Complete =====
echo Check the output above for any errors.
pause
