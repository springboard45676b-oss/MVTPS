# Maritime Platform Setup Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

## Backend Setup

1. Navigate to the backend directory:
```bash
cd maritime-platform-complete/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
copy .env.example .env
```
Edit the `.env` file and add your secret key.

5. Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser (optional):
```bash
python manage.py createsuperuser
```

7. Load sample data (optional):
```bash
python manage.py loaddata sample_data.json
```

8. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd maritime-platform-complete/frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Login

After setting up, you can register a new account or use the superuser account you created.

## Features Available

1. **User Authentication**: Register/Login with JWT tokens
2. **Dashboard**: Overview of maritime data
3. **Vessel Tracking**: Interactive map with vessel positions
4. **Port Analytics**: Port congestion and statistics
5. **Safety Overlays**: Safety zones and weather data
6. **Analytics**: Historical voyage data and reports

## API Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/vessels/` - List vessels
- `GET /api/ports/` - List ports
- `GET /api/safety/zones/` - Safety zones
- `GET /api/analytics/dashboard/` - Analytics dashboard

## Next Steps

1. Add real maritime API integrations
2. Implement real-time updates with WebSockets
3. Add more detailed analytics and reporting
4. Implement role-based permissions
5. Add data export functionality