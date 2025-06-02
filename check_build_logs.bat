@echo off
echo ===== Checking Build Logs =====

echo Getting build logs from VPS...

ssh root@74.208.160.198 "cd /root/AncestryChain && docker compose logs --tail=100 app"

echo.
echo If you don't see any errors above, try getting the full build output with:
echo docker compose logs --no-log-prefix app | findstr /C:"error" /C:"fail" /C:"warn" /C:"npm ERR"
echo.
pause
