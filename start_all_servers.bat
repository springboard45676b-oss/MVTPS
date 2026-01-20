@echo off
echo ========================================
echo 🚢 Maritime Platform - Starting All Servers
echo ========================================

echo.
echo 📋 Starting Django Backend Server...
echo ----------------------------------------
start "Django Backend" cmd /k "cd backend && python manage.py runserver"

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 📋 Starting React Frontend Server...
echo ----------------------------------------
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://127.0.0.1:8000
echo.
echo 💡 Keep both terminal windows open while using the application
echo 🛑 Press Ctrl+C in each terminal to stop the servers
echo.
pause