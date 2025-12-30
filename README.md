# Maritime Vessel Tracking Platform

A comprehensive full-stack web platform for interactive live vessel tracking, port analytics, and safety visualization.

## Features

- **Authentication & Role Management**: JWT-based authentication with user roles (Operator, Analyst, Admin)
- **Live Vessel Tracking**: Real-time vessel positions and metadata
- **Port Analytics**: Congestion analysis and port statistics
- **Safety Overlays**: Weather, piracy zones, and accident data
- **Historical Replay**: Voyage history and compliance tracking
- **Interactive Dashboards**: Role-based analytics and visualizations

## Tech Stack

- **Frontend**: React.js with interactive maps
- **Backend**: Django REST Framework
- **Database**: SQLite3
- **Authentication**: JWT tokens
- **Maps**: Leaflet/OpenStreetMap integration

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
maritime-platform-complete/
├── backend/                 # Django REST API
│   ├── maritime_backend/   # Main Django project
│   ├── authentication/    # User auth & JWT
│   ├── vessels/          # Vessel tracking
│   ├── ports/           # Port analytics
│   ├── safety/          # Safety overlays
│   └── analytics/       # Historical data
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Main pages
│   │   ├── services/   # API services
│   │   └── utils/      # Utilities
└── docs/               # Documentation
```