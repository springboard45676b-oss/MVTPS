@echo off
echo Setting up Maritime Platform Development Environment...

echo.
echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt

echo.
echo Running Database Migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating Superuser (Optional)...
echo You can create a superuser by running: python manage.py createsuperuser

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
npm install

echo.
echo Setup Complete!
echo.
echo To start development servers:
echo Backend: cd backend && python manage.py runserver
echo Frontend: cd frontend && npm start
echo.
pause