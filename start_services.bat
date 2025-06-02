@echo off
echo ===== Starting AncestryChain Services =====

echo 1. Starting Docker Compose services in detached mode...
ssh root@209.46.122.165 "cd /root/AncestryChain && docker compose up -d"

echo.
echo 2. Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo 3. Checking running containers...
ssh root@209.46.122.165 "docker ps"

echo.
echo 4. Checking application logs...
ssh root@209.46.122.165 "cd /root/AncestryChain && docker compose logs --tail=50"

echo.
echo ===== Services Started =====
echo Check the output above to ensure all services are running correctly.
pause
