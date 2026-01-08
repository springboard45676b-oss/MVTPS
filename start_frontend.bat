@echo off
echo 🎨 Starting Frontend Development Server
echo =====================================

cd /d "%~dp0frontend"
echo Installing dependencies...
npm install
echo.
echo Starting React development server...
npm run dev
