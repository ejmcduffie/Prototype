@echo off
echo ===== Checking VPS Setup Status =====

echo [%TIME%] 1. Checking if setup is still running...
ssh root@74.208.160.198 "if pgrep -f direct_setup.sh > /dev/null; then echo 'Setup is still running. Check logs with:'; echo 'ssh root@74.208.160.198 "tail -f /root/setup_output.log"'; else echo 'Setup has completed. Checking services...'; fi"

echo.
echo [%TIME%] 2. Checking application status...
ssh root@74.208.160.198 "pm2 list 2>/dev/null || echo 'PM2 not running or application not started'"

echo.
echo [%TIME%] 3. Checking service status...
ssh root@74.208.160.198 "echo 'MongoDB: ' \$(systemctl is-active mongod 2>/dev/null || echo 'not active'); echo 'Redis: ' \$(systemctl is-active redis-server 2>/dev/null || echo 'not active'); echo 'Nginx: ' \$(systemctl is-active nginx 2>/dev/null || echo 'not active')"

echo.
echo [%TIME%] 4. Checking recent logs (last 10 lines)...
ssh root@74.208.160.198 "[ -f /root/setup_output.log ] && tail -n 10 /root/setup_output.log || echo 'No setup log file found'"

echo.
echo ===== Next Steps =====
echo 1. View full setup log: ssh root@74.208.160.198 "cat /root/setup_output.log"
echo 2. View application logs: ssh root@74.208.160.198 "pm2 logs ancestrychain --lines 50"
echo 3. Access application: http://74.208.160.198

pause
