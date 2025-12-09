# Maritime Vessel Tracking Platform - Week 1 & 2

A full-stack web platform for maritime vessel tracking, port analytics, and safety visualization.

## 🚀 Project Overview

This platform provides interactive live vessel tracking, cargo classification, port congestion analytics, and safety overlays using open maritime and weather data sources. Built for shipping companies, port authorities, and maritime insurers.

## 📋 Week 1 & 2 Implementation

### ✅ Completed Features

- **Authentication System**
  - JWT-based authentication
  - User registration and login
  - Role-based access control (Operator, Analyst, Admin)
  - Protected routes
  - Token refresh mechanism

- **Database Models**
  - Users with role management
  - Vessels (name, flag, position, type)
  - Ports (name, country, location)
  - Voyages (vessel, ports, cargo, status)
  - Events (vessel events with location and details)
  - Notifications (user notifications)
  - Congestions (port congestion metrics)
  - Arrivals/Departures (port traffic statistics)

- **User Interface**
  - Registration page with role selection
  - Login page with authentication
  - Dashboard with user info and statistics
  - Profile management page
  - Maritime-themed styling with Tailwind CSS

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development) / PostgreSQL (production)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: React Icons

## 📦 Installation & Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd maritime_backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd maritime_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/logout/` - Logout (blacklist refresh token)
- `GET /api/auth/profile/` - Get user profile (protected)
- `PUT /api/auth/profile/` - Update user profile (protected)
- `POST /api/auth/token/refresh/` - Refresh access token

### Admin Panel
- `http://localhost:8000/admin/` - Django admin interface

## 👥 User Roles

- **OPERATOR**: View-only access to vessel and port data
- **ANALYST**: View access + analytics and reporting capabilities
- **ADMIN**: Full access including user management and system configuration

## 📊 Database Schema

### Users Table
- id, username, email, password, name, role, operator, created_at

### Vessels Table
- id, name, flag, last_position_lat, last_position_lon, last_update, type

### Ports Table
- id, name, country, last_update

### Voyages Table
- id, vessel_id, imo_number, port_from, port_to, departure_time, arrival_time, status, created_at, cargo_type

### Events Table
- id, vessel_id, event_type, location, details, timestamp

### Notifications Table
- id, user_id, message, timestamp

### Congestions Table
- id, port_id, congestion_score, avg_wait_time, last_update

### Arrivals/Departures Table
- id, port_id, arrivals, departures, timestamp

## 🧪 Testing

### Backend Tests
```bash
cd maritime_backend
python manage.py test accounts
python manage.py test vessels
```

### Manual Testing Flow
1. Open `http://localhost:5173`
2. Click "Register" and create a new account
3. Login with your credentials
4. View the dashboard
5. Navigate to Profile and update your information
6. Logout and verify redirect to login page

## 📁 Project Structure

```
Bhumika_Assignment/
├── maritime_backend/
│   ├── config/              # Django project settings
│   ├── accounts/            # User authentication app
│   │   ├── models.py        # CustomUser model
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── permissions.py   # Role-based permissions
│   │   └── urls.py          # Auth endpoints
│   ├── vessels/             # Maritime data app
│   │   ├── models.py        # Vessel, Port, Voyage, etc.
│   │   └── admin.py         # Admin configuration
│   ├── manage.py
│   └── requirements.txt
│
├── maritime_frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Tailwind styles
│   ├── package.json
│   └── tailwind.config.js
│
└── todo.md                  # Project requirements
```

## 🔜 Next Steps (Week 3-4)

- Integrate MarineTraffic and AIS Hub APIs
- Build vessel search and filter UI
- Display vessels on interactive map (Leaflet/Mapbox)
- Implement real-time position updates
- Enable vessel alert subscriptions

## 📝 Notes

- Default database is SQLite for development
- CORS is configured for localhost:5173 and localhost:3000
- JWT access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- All passwords are hashed using Django's default password hasher

## 🤝 Contributing

This is a learning project for maritime vessel tracking implementation.

## 📄 License

Educational project - Week 1 & 2 Implementation
