@echo off
echo ===== AncestryChain Fix Script =====

echo Transferring fixes to VPS...

REM Transfer the fix scripts to the VPS
scp "D:\Website demos\ancestrychain\fix_auth.sh" ^
   "D:\Website demos\ancestrychain\fix_eslint.sh" ^
   "D:\Website demos\ancestrychain\fix_family_tree_route.sh" ^
   "D:\Website demos\ancestrychain\fix_auth_route.sh" ^
   "D:\Website demos\ancestrychain\update_deps.sh" ^
   root@209.46.122.165:/tmp/

echo.
echo ===== Executing fixes on VPS =====

REM Execute the scripts on the VPS
ssh root@209.46.122.165 "^
   chmod +x /tmp/fix_*.sh /tmp/update_deps.sh && ^
   cd /root/AncestryChain && ^
   /tmp/update_deps.sh && ^
   /tmp/fix_auth.sh && ^
   /tmp/fix_eslint.sh && ^
   /tmp/fix_family_tree_route.sh && ^
   /tmp/fix_auth_route.sh && ^
   docker compose build --no-cache && ^
   docker compose up -d"

echo.
echo ===== Process Complete =====
echo If you see any errors, please check the output above.
echo You can also check the logs with: docker compose logs -f app
echo.
pause
