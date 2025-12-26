# Maritime Vessel Tracking Platform - Milestone 1

A full-stack web application for maritime vessel tracking with Django REST Framework backend and React frontend.

## ✅ Milestone 1 Features

### Backend (Django REST Framework)
- ✅ User authentication with JWT tokens
- ✅ User roles: Operator, Analyst, Admin
- ✅ Complete database schema (Users, Vessels, Ports, Voyages, Events, Notifications)
- ✅ CRUD APIs for user profiles
- ✅ Token refresh mechanism
- ✅ Role-based permissions

### Frontend (React)
- ✅ Modern React application with Material-UI
- ✅ Login and Registration forms
- ✅ JWT token handling and storage
- ✅ Protected routes
- ✅ User profile management (CRUD)
- ✅ Responsive design

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Option 1: Automated Setup
```bash
python setup.py
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📱 Usage

1. **Access the application**: http://localhost:3000
2. **Register a new account** or use admin credentials
3. **Login** with your credentials
4. **View dashboard** with user information
5. **Edit profile** to update user details

## 🔐 Authentication

- **JWT-based authentication** with access and refresh tokens
- **Automatic token refresh** on API calls
- **Secure token storage** in localStorage
- **Protected routes** requiring authentication

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Operator** | Basic user with standard access |
| **Analyst** | Advanced user with analytical capabilities |
| **Admin** | Full system administration access |

## 🗄️ Database Schema

### Models Implemented
- **User**: Extended Django user with roles and company info
- **Port**: Maritime ports with location data
- **Vessel**: Ships with type, capacity, and current location
- **Voyage**: Trip information between ports
- **Event**: System events and alerts
- **Notification**: User notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Data Management
- `GET /api/vessels/` - List vessels
- `GET /api/ports/` - List ports
- `GET /api/voyages/` - List voyages
- `GET /api/events/` - List events
- `GET /api/notifications/` - User notifications

## 🛠️ Technology Stack

### Backend
- Django 4.2
- Django REST Framework
- JWT Authentication
- SQLite (development)

### Frontend
- React 18
- Material-UI 5
- React Router 6
- Axios for API calls

## 📋 Project Structure

```
MVTPS/
├── backend/
│   ├── api/
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # API serializers
│   │   ├── views.py           # API views
│   │   └── urls.py            # API routes
│   ├── backend/
│   │   ├── settings.py        # Django settings
│   │   └── urls.py            # Main URL config
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── services/          # API services
│   │   └── App.js             # Main app component
│   └── package.json
└── setup.py                   # Automated setup script
```

## 🔄 Next Milestones

- **Milestone 2**: Live vessel tracking with maps
- **Milestone 3**: Port analytics and safety overlays
- **Milestone 4**: Historical replay and deployment

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Run migrations: `python manage.py migrate`
- Check Django server is running on port 8000

### Frontend Issues
- Install dependencies: `npm install`
- Ensure React dev server is running on port 3000
- Check browser console for JavaScript errors

### CORS Issues
- Backend CORS is configured for localhost:3000
- Ensure both servers are running on correct ports

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Ensure both backend and frontend servers are running
4. Check browser developer tools for errors