# Development Guide

## 🚀 Quick Start
Run `setup.bat` to automatically set up the development environment.

## 📁 Optimized Folder Structure

### Backend (`/backend/`)
```
backend/
├── core/                   # Shared utilities
│   ├── constants.py        # Application constants
│   └── __init__.py
├── backend/               # Django project configuration
├── accounts/              # User management
├── vessels/               # Vessel management
├── ports/                 # Port management  
├── voyages/               # Voyage tracking
├── notifications/         # User notifications
├── manage.py
├── requirements.txt
└── .env.example          # Environment template
```

### Frontend (`/frontend/`)
```
frontend/
├── src/
│   ├── constants/         # Application constants
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API services & context
│   ├── App.js
│   └── index.js
├── public/
└── package.json
```

## 🔧 Key Optimizations Made

### 1. **Constants Management**
- Centralized constants in `backend/core/constants.py`
- Frontend constants in `src/constants/index.js`
- Eliminates magic strings and improves maintainability

### 2. **Admin Interface**
- Added Django admin for all models
- Easy data management during development
- Better debugging capabilities

### 3. **Environment Configuration**
- `.env.example` template for environment variables
- Secure configuration management
- Easy deployment setup

### 4. **Code Organization**
- Removed duplicate/unused files
- Clear separation of concerns
- Consistent naming conventions

### 5. **Documentation**
- Comprehensive README.md
- Development guide
- Clear project structure

## 🛠️ Development Workflow

### Backend Development
```bash
cd backend
python manage.py runserver
```

### Frontend Development  
```bash
cd frontend
npm start
```

### Database Management
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## 📋 Functionality Verification

### ✅ All Features Preserved
- User authentication with JWT
- Role-based access control
- Database models for maritime operations
- React frontend with modern UI
- Protected routes
- API endpoints

### ✅ Enhanced Features
- Better code organization
- Centralized constants
- Admin interface
- Environment configuration
- Development scripts
- Comprehensive documentation

## 🔍 Testing Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login  
- `GET /api/auth/profile/` - User profile
- `POST /api/auth/token/refresh/` - Token refresh

### Admin Interface
- Visit `http://localhost:8000/admin/` after creating superuser

## 📈 Next Steps
1. Test authentication flow
2. Add vessel tracking features
3. Implement real-time updates
4. Add data visualization
5. Deploy to production