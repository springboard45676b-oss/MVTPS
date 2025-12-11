# Maritime Vessel Tracking Platform (MVTPS)

## 📋 Project Overview
A comprehensive maritime platform for vessel tracking, port management, and voyage analytics with role-based access control.

## 🏗️ Project Structure
```
MVTPS/
├── backend/                    # Django REST API
│   ├── backend/               # Django project settings
│   │   ├── settings.py        # Main configuration
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI config
│   ├── accounts/             # User management & authentication
│   │   ├── models.py         # User model with roles
│   │   ├── views.py          # Auth endpoints
│   │   ├── serializers.py    # API serializers
│   │   └── urls.py           # Auth routes
│   ├── vessels/              # Vessel management
│   │   └── models.py         # Vessel & Position models
│   ├── ports/                # Port management
│   │   └── models.py         # Port model
│   ├── voyages/              # Voyage tracking
│   │   └── models.py         # Voyage & Event models
│   ├── notifications/        # User notifications
│   │   └── models.py         # Notification model
│   ├── manage.py             # Django management
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React application
│   ├── public/               # Static files
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable components
│   │   │   └── PrivateRoute.js
│   │   ├── pages/            # Page components
│   │   │   ├── Login.js      # Login page
│   │   │   ├── Register.js   # Registration page
│   │   │   └── Dashboard.js  # Main dashboard
│   │   ├── services/         # API & context
│   │   │   ├── api.js        # Axios configuration
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry point
│   └── package.json          # Node dependencies
└── README.md                 # This file
```

## 👥 User Roles
- **Operator**: Basic vessel tracking operations
- **Analyst**: Data analysis and reporting capabilities  
- **Admin**: Full system administration access

## 🗄️ Database Schema
- **Users**: Authentication with role-based access
- **Vessels**: Ship information and real-time positions
- **Ports**: Port details and geographical data
- **Voyages**: Trip planning and tracking
- **Events**: Voyage events (departure, arrival, delays)
- **Notifications**: User alerts and system messages

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
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

## 🔗 API Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - User profile
- `POST /api/auth/token/refresh/` - Token refresh

## 🛠️ Technology Stack
- **Backend**: Django, Django REST Framework, JWT Authentication
- **Frontend**: React, React Router, Axios
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens with refresh mechanism

## 📱 Features Implemented (Week 1)
✅ User authentication system
✅ Role-based access control
✅ Database schema design
✅ JWT token management
✅ Responsive UI design
✅ Protected routes
✅ User registration/login

## 🔄 Development Status
**Current**: Week 1 - Authentication & Setup ✅
**Next**: Week 2 - Vessel tracking implementation