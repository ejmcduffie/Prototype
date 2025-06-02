@echo off
echo ===== Starting Clean Rebuild =====
echo This will rebuild your application with a fresh start.
echo.

echo Step 1: Stopping and removing existing containers...
ssh root@209.46.122.165 "cd /root/AncestryChain && docker compose down"

echo.
echo Step 2: Removing node_modules and package-lock.json...
ssh root@209.46.122.165 "cd /root/AncestryChain && rm -rf node_modules package-lock.json"

echo.
echo Step 3: Reinstalling dependencies...
ssh root@209.46.122.165 "cd /root/AncestryChain && npm install --legacy-peer-deps"

echo.
echo Step 4: Building the application...
ssh root@209.46.122.165 "cd /root/AncestryChain && npm run build"

echo.
echo Step 5: Starting the application...
ssh root@209.46.122.165 "cd /root/AncestryChain && docker compose up -d --build"

echo.
echo ===== Rebuild Complete =====
echo Check the logs with: docker compose logs -f app
echo.
pause
