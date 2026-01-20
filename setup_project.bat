@echo off
echo ========================================
echo 🔧 Maritime Platform Setup
echo ========================================
echo.

echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
echo ✅ Python dependencies installed
echo.

echo Running database migrations...
python manage.py migrate
echo ✅ Database setup complete
echo.

echo Installing Node.js dependencies...
cd ../frontend
npm install
echo ✅ Node.js dependencies installed
echo.

echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo To start the project:
echo 1. Backend:  cd backend && python manage.py runserver
echo 2. Frontend: cd frontend && npm start
echo.
pause