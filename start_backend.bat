@echo off
echo Starting Maritime Platform Backend...

cd backend

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo Creating sample data...
python sample_data.py

echo Starting Django server...
python manage.py runserver

pause