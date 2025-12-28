# Maritime Vessel Tracking

Full-stack reference implementation with Django REST Framework + JWT auth and a Vite/React frontend.

## Backend
1. `cd backend`
2. `python -m venv venv && venv\\Scripts\\activate` (Windows)  
3. `pip install -r requirements.txt`
4. `python manage.py makemigrations && python manage.py migrate`
5. `python manage.py createsuperuser` (optional)
6. `python manage.py runserver`

## Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

The React app expects the API at `http://localhost:8000/api/`.











