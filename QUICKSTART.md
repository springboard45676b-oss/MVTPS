# Maritime Platform - Quick Start Guide

## 🚀 Quick Setup (Windows)

### Option 1: Using Batch Files (Easiest)

1. **Start Backend:**
   - Double-click `start_backend.bat`
   - Wait for "Starting development server at http://127.0.0.1:8000/"

2. **Start Frontend:**
   - Double-click `start_frontend.bat`
   - Wait for browser to open at http://localhost:3000

### Option 2: Manual Setup

#### Backend Setup
```bash
cd maritime-platform-complete/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python sample_data.py
python manage.py runserver
```

#### Frontend Setup
```bash
cd maritime-platform-complete/frontend
npm install
npm start
```

## 🔐 Test Accounts

After running the sample data script, you can login with:

- **Admin Account:**
  - Username: `admin`
  - Password: `admin123`

- **Operator Account:**
  - Username: `operator`
  - Password: `operator123`

## 🌟 Features to Test

1. **Registration/Login**
   - Create new account or use test accounts
   - JWT token authentication

2. **Dashboard**
   - Overview of maritime statistics
   - Quick navigation to all features

3. **Vessel Tracking**
   - Interactive map with vessel positions
   - Filter vessels by type, flag, name
   - Subscribe/unsubscribe to vessel updates

4. **Port Analytics**
   - Port locations with congestion data
   - Color-coded congestion levels
   - Filter by country and search

5. **Safety Overlays**
   - Safety zones (piracy, storms, restricted areas)
   - Weather data points
   - Risk level visualization

6. **Analytics**
   - Voyage statistics and charts
   - Historical voyage data
   - Recent events timeline

## 🛠 Tech Stack

- **Backend:** Django REST Framework, SQLite, JWT Authentication
- **Frontend:** React, Leaflet Maps, Recharts, Axios
- **Database:** SQLite (included sample data)

## 📊 Sample Data Included

- 5 Major ports (Los Angeles, Shanghai, Singapore, Rotterdam, Hamburg)
- 5 Sample vessels with position history
- Safety zones (piracy areas, storm warnings, restricted zones)
- Weather data points
- Voyage history and events
- Port congestion data

## 🔧 Troubleshooting

**Backend Issues:**
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Activate virtual environment before running commands

**Frontend Issues:**
- Ensure Node.js 16+ is installed
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

**Database Issues:**
- Delete `db.sqlite3` and run migrations again
- Re-run `python sample_data.py`

## 🚀 Next Steps

1. **API Integration:** Add real maritime APIs (MarineTraffic, AIS Hub)
2. **Real-time Updates:** Implement WebSocket connections
3. **Advanced Analytics:** Add more detailed reporting
4. **Mobile App:** Create React Native mobile version
5. **Deployment:** Deploy to cloud platforms (AWS, Heroku, etc.)

## 📝 API Documentation

Once running, visit:
- Backend API: http://localhost:8000/admin/ (Django Admin)
- API Endpoints: http://localhost:8000/api/
- Frontend: http://localhost:3000

## 🤝 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure both backend and frontend are running
4. Check network connectivity between services