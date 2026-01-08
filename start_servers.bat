@echo off
echo 🚀 Starting Maritime Vessel Tracking Servers
echo ========================================

echo.
echo 📋 Prerequisites Check:
echo 1. Make sure Redis is installed and running
echo 2. Make sure Node.js and Python are installed
echo.

echo 🔧 Starting Backend Server with WebSocket support...
cd /d "%~dp0backend"
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Django with Daphne (WebSocket support)...
daphne backend.asgi:application -b 0.0.0.0 -p 8000
pause
