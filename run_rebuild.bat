@echo off
echo ===== Rebuilding Application on VPS =====

echo Transferring rebuild script to VPS...
scp "D:\Website demos\ancestrychain\rebuild_app.sh" root@209.46.122.165:/tmp/

echo.
echo ===== Executing Rebuild on VPS =====
ssh root@209.46.122.165 "chmod +x /tmp/rebuild_app.sh && /tmp/rebuild_app.sh"

echo.
echo ===== Rebuild Complete =====
echo Check the logs with: ssh root@209.46.122.165 "cd /opt/ancestrychain && docker compose logs -f app"
echo.
pause
