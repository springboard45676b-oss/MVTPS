@echo off
echo Starting Maritime Platform with Real Ship Data
echo =============================================

cd backend

echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py migrate

echo Starting Django server...
echo.
echo The server will start with AIS Stream integration enabled.
echo Use the API endpoints to start/stop real ship data streaming.
echo.
echo API Endpoints:
echo - GET  /api/vessels/ais-status/     - Check streaming status
echo - POST /api/vessels/ais-start/      - Start streaming
echo - POST /api/vessels/ais-stop/       - Stop streaming  
echo - GET  /api/vessels/live/           - Get live vessel data
echo.

python manage.py runserver