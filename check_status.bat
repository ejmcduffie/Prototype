@echo off
echo ===== Checking Application Status =====

echo.
echo 1. Checking running containers...
ssh root@209.46.122.165 "docker ps"

echo.
echo 2. Checking application logs (last 20 lines)...
ssh root@209.46.122.165 "cd /root/AncestryChain && docker compose logs --tail=20"

echo.
echo 3. Checking build logs if available...
ssh root@209.46.122.165 "if [ -f /root/AncestryChain/npm-debug.log ]; then tail -n 20 /root/AncestryChain/npm-debug.log; else echo 'No npm-debug.log found'; fi"

echo.
echo ===== Status Check Complete =====
pause
