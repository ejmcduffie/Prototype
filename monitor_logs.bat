@echo off
echo ===== Monitoring Application Logs =====
echo Press Ctrl+C to stop monitoring...

:loop
ssh root@209.46.122.165 "cd /opt/ancestrychain && docker compose logs --tail=20"
timeout /t 5 /nobreak >nul
cls
goto loop
