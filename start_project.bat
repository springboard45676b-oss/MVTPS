@echo off
echo ========================================
echo 🚢 Maritime Platform Startup
echo ========================================
echo.

echo Starting Django Backend...
cd backend
start "Django Backend" cmd /k "python manage.py runserver"
echo ✅ Backend starting at http://127.0.0.1:8000/
echo.

echo Starting React Frontend...
cd ../frontend
start "React Frontend" cmd /k "npm start"
echo ✅ Frontend starting at http://localhost:3000/
echo.

echo ========================================
echo 🎉 Maritime Platform Started!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000/
echo Frontend: http://localhost:3000/
echo.
echo Press any key to continue...
pause