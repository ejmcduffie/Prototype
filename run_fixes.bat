@echo off
echo ===== Running Fixes =====

echo 1. Transferring fix scripts to VPS...
scp "D:\Website demos\ancestrychain\fix_nextauth_route.sh" ^
   "D:\Website demos\ancestrychain\fix_eslint_config.sh" ^
   root@74.208.160.198:/tmp/

echo.
echo 2. Making scripts executable and running them...
ssh root@74.208.160.198 "^
   chmod +x /tmp/fix_nextauth_route.sh ^&^& ^
   chmod +x /tmp/fix_eslint_config.sh ^&^& ^
   /tmp/fix_nextauth_route.sh ^&^& ^
   /tmp/fix_eslint_config.sh"

echo.
echo 3. Rebuilding the application...
ssh root@74.208.160.198 "^
   cd /root/AncestryChain ^&^& ^
   npm run build"

echo.
echo ===== Fixes Complete =====
echo If you see any errors, please check the output above.
pause
