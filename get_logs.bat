@echo off
echo ===== Getting Docker Logs =====

REM Get the last 50 lines of logs from the app container
ssh root@209.46.122.165 "cd /opt/ancestrychain && docker compose logs --tail=50 app"

echo.
echo ===== End of Logs =====
pause
