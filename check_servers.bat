@echo off
echo ========================================
echo 🔍 Maritime Platform - Server Status Check
echo ========================================

echo.
echo 📋 Checking Django Backend (Port 8000)...
echo ----------------------------------------
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://127.0.0.1:8000/api/auth/login/ 2>nul
if errorlevel 1 (
    echo ❌ Django Backend: NOT RUNNING
    echo 💡 Start with: cd backend ^&^& python manage.py runserver
) else (
    echo ✅ Django Backend: RUNNING
)

echo.
echo 📋 Checking React Frontend (Port 3000)...
echo ----------------------------------------
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://localhost:3000 2>nul
if errorlevel 1 (
    echo ❌ React Frontend: NOT RUNNING
    echo 💡 Start with: cd frontend ^&^& npm start
) else (
    echo ✅ React Frontend: RUNNING
)

echo.
echo 📋 Quick Login Test...
echo ----------------------------------------
curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://127.0.0.1:8000/api/auth/login/ 2>nul | findstr "access" >nul
if errorlevel 1 (
    echo ❌ Login Test: FAILED
    echo 💡 Check if backend is running and credentials are correct
) else (
    echo ✅ Login Test: PASSED
)

echo.
echo ========================================
echo 💡 If servers are not running, use: start_all_servers.bat
echo 🌐 Access application at: http://localhost:3000
echo ========================================
pause