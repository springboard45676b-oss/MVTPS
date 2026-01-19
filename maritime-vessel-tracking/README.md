# 🚢 MV - Maritime Vessel Tracking Platform

A comprehensive full-stack web application for real-time maritime vessel tracking, port analytics, and safety visualization.

![Maritime Vessel Tracking](https://img.shields.io/badge/Version-2.0.0-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/Frontend-HTML%2FJS-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Screenshots](#screenshots)

## 🌊 Overview

The Maritime Vessel Tracking Platform is a production-ready full-stack application designed for shipping companies, port authorities, maritime analysts, and insurers. It provides real-time vessel tracking, port congestion analytics, safety overlays, and comprehensive voyage management.

## ✨ Features

### 🔐 Authentication & Role Management
- JWT-based authentication
- Multiple user roles: Administrator, Analyst, Operator, Insurer
- Role-based access control (RBAC)
- Secure login/logout with token refresh

### 🗺️ Live Vessel Tracking
- Real-time vessel positions via AIS data
- Vessel metadata (IMO, MMSI, type, flag, cargo)
- Interactive world map with live updates
- Advanced filtering and search

### ⚓ Port Analytics
- Port congestion scoring
- Average wait time analysis
- Arrival/departure tracking
- Port comparison dashboards

### ⚠️ Safety & Risk Overlays
- Weather overlays (storms, wind, waves)
- Piracy risk zone visualization
- Incident data mapping
- Real-time alert system

### 📊 Historical Voyage Replay
- Voyage route visualization
- Playback controls with timeline
- Compliance audit trail
- Detailed voyage logs

### 📈 Analytics Dashboard
- Fleet performance metrics
- Fuel efficiency trends
- Top routes analysis
- Revenue tracking

### ⚙️ Admin Panel
- User management (CRUD)
- API source monitoring
- System health dashboard
- Logs and data export

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Production database
- **Redis** - Caching & task queue
- **Celery** - Background tasks
- **JWT** - Authentication

### Frontend
- **HTML5 / CSS3 / JavaScript ES6+**
- **Tailwind CSS** - Styling
- **Leaflet.js** - Interactive maps
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

### DevOps
- **Docker & Docker Compose**
- **Nginx** - Reverse proxy
- **Gunicorn** - WSGI server

## 📁 Project Structure

```
maritime-vessel-tracking/
│
├── 📄 index.html              # Main frontend application
├── 📄 docker-compose.yml      # Docker orchestration
├── 📄 nginx.conf              # Nginx configuration
├── 📄 README.md               # Documentation
│
├── 📂 css/
│   └── styles.css             # Custom styles
│
├── 📂 js/
│   ├── api.js                 # API client & services
│   ├── app.js                 # Main application logic
│   ├── data.js                # Mock data (fallback)
│   ├── charts.js              # Chart configurations
│   └── maps.js                # Map functions
│
└── 📂 backend/
    ├── 📄 manage.py           # Django management
    ├── 📄 requirements.txt    # Python dependencies
    ├── 📄 Dockerfile          # Backend container
    ├── 📄 .env.example        # Environment template
    │
    ├── 📂 maritime/           # Django project
    │   ├── settings.py        # Configuration
    │   ├── urls.py            # Main URLs
    │   └── wsgi.py            # WSGI config
    │
    └── 📂 api/                # API application
        ├── models.py          # Database models
        ├── serializers.py     # DRF serializers
        ├── views.py           # API views
        ├── urls.py            # API routes
        ├── admin.py           # Admin config
        └── management/
            └── commands/
                └── seed_data.py  # Data seeding
```

## 🚀 Quick Start

### Option 1: Frontend Only (Mock Data)
```bash
# Simply open in browser
open index.html

# Or use a local server
npx serve
```

### Option 2: Full Stack with Docker
```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# API Docs: http://localhost:8000/swagger/
# Admin: http://localhost:8000/admin/
```

### Demo Credentials
- **Email:** admin@maritime.com
- **Password:** admin123
- **Role:** Administrator

## 🔧 Backend Setup (Development)

### Prerequisites
- Python 3.11+
- PostgreSQL 15+ (or SQLite for development)
- Redis (for Celery)

### Step-by-Step Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your settings

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Seed sample data
python manage.py seed_data

# 8. Run development server
python manage.py runserver

# 9. (Optional) Start Celery worker
celery -A maritime worker --loglevel=info

# 10. (Optional) Start Celery beat
celery -A maritime beat --loglevel=info
```

### Database Options

**SQLite (Development):**
```python
# settings.py - default configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**PostgreSQL (Production):**
```bash
# .env file
DB_ENGINE=django.db.backends.postgresql
DB_NAME=maritime_db
DB_USER=maritime_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | User registration |
| POST | `/auth/login/` | User login |
| POST | `/auth/logout/` | User logout |
| POST | `/auth/refresh/` | Refresh access token |
| GET | `/auth/profile/` | Get user profile |
| PATCH | `/auth/profile/` | Update profile |
| POST | `/auth/change-password/` | Change password |

### Vessel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vessels/` | List all vessels |
| GET | `/vessels/{id}/` | Get vessel details |
| GET | `/vessels/live/` | Get live positions |
| GET | `/vessels/stats/` | Get vessel statistics |
| GET | `/vessels/{id}/events/` | Get vessel events |
| GET | `/vessels/{id}/voyages/` | Get vessel voyages |
| POST | `/vessels/` | Create vessel |
| PATCH | `/vessels/{id}/` | Update vessel |
| DELETE | `/vessels/{id}/` | Delete vessel |

### Port Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ports/` | List all ports |
| GET | `/ports/{id}/` | Get port details |
| GET | `/ports/analytics/` | Get port analytics |
| GET | `/ports/congestion/` | Get congestion data |

### Voyage Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/voyages/` | List all voyages |
| GET | `/voyages/{id}/` | Get voyage details |
| GET | `/voyages/history/` | Get voyage history |
| GET | `/voyages/active/` | Get active voyages |
| GET | `/voyages/{id}/waypoints/` | Get voyage waypoints |
| GET | `/voyages/{id}/audit/` | Get audit trail |

### Safety Zones Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/safety-zones/` | List all zones |
| GET | `/safety-zones/active/` | Get active zones |
| GET | `/safety-zones/piracy/` | Get piracy zones |
| GET | `/safety-zones/weather/` | Get weather zones |

### Dashboard & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Get dashboard stats |
| GET | `/system/health/` | System health check |
| GET | `/events/` | List events |
| GET | `/notifications/` | List notifications |

### Interactive API Docs
- **Swagger UI:** http://localhost:8000/swagger/
- **ReDoc:** http://localhost:8000/redoc/

## 🐳 Docker Deployment

### Services
- **db** - PostgreSQL database
- **redis** - Redis for Celery
- **backend** - Django API server
- **celery** - Background worker
- **celery-beat** - Task scheduler
- **frontend** - Nginx serving static files

### Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d

# Execute commands in backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `True` |
| `SECRET_KEY` | Django secret key | Required |
| `DB_ENGINE` | Database engine | `sqlite3` |
| `DB_NAME` | Database name | `maritime_db` |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `DB_HOST` | Database host | `localhost` |
| `CELERY_BROKER_URL` | Redis URL | `redis://localhost:6379/0` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` |

## 🔌 External API Integration

The platform supports integration with:

| API | Purpose | Configuration |
|-----|---------|---------------|
| MarineTraffic | Vessel AIS data | `MARINE_TRAFFIC_API_KEY` |
| NOAA | Weather data | `NOAA_API_KEY` |
| UNCTAD | Trade analytics | Public API |

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#3b82f6` | Actions, highlights |
| Dark Blue | `#1e40af` | Sidebar, headers |
| Success Green | `#22c55e` | Cargo vessels, positive |
| Danger Red | `#ef4444` | Tankers, alerts |
| Warning Yellow | `#f59e0b` | Warnings |
| Purple | `#a855f7` | Passenger vessels |

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@maritime.com or open an issue on GitHub.

---

**🚢 MV Platform** - Maritime Vessel Tracking Made Simple