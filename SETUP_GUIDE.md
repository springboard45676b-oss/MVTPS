# Role-Based Registration & Routing Setup Guide

This guide explains the complete setup for role-based user registration, login, and dashboard routing.

## ⚠️ IMPORTANT: Frontend Setup

### 1. **Install React Router Dependencies**

If you see error: `Can't resolve 'react-router-dom'`, follow these steps:

```powershell
# Stop the React dev server (Ctrl+C if running)

# Navigate to frontend directory
cd "c:\Users\YASHTI\Desktop\INFOSYS\pro\FRONTEND\login-signup\login-signup"

# Clear cache and reinstall (if needed)
rm -r node_modules -Force
npm cache clean --force

# Install dependencies
npm install

# Start the dev server
npm start
```

### 2. **React Router Routing Structure**

After setup, the following routes are available:

| URL | Component | Access |
|-----|-----------|--------|
| `/` | LoginSignup | Public |
| `/home` | Home | Authenticated users |
| `/operator` | Operator Dashboard | Operator role only |
| `/admin` | Admin Dashboard | Admin role only |
| `/analyst` | Analyst Dashboard | Analyst role only |
| `/unauthorized` | Unauthorized | Failed role check |

### 3. **Frontend File Changes**

Updated files:
- **`App.js`**: Added React Router setup with protected routes
- **`components/LoginSignup/loginsignup.jsx`**: Added redirect on successful login
- **`pages/Operator.jsx`**: Operator dashboard with logout
- **`pages/Admin.jsx`**: Admin dashboard with logout
- **`pages/Analyst.jsx`**: Analyst dashboard with logout
- **`pages/Home.jsx`**: Generic authenticated home page
- **`pages/Unauthorized.jsx`**: Unauthorized access page

## Backend Setup

### 1. **Apply Database Migrations**

After updating the models, run the following commands in the backend folder:

```powershell
cd c:\Users\YASHTI\Desktop\INFOSYS\pro\BACKEND\backend
python manage.py makemigrations accounts
python manage.py migrate
```

This will create the `UserProfile` table to store user roles.

### 2. **Backend File Changes**

The following files were updated:

- **`accounts/models.py`**: Added `UserProfile` model with role choices (operator, admin, analyst)
- **`accounts/admin.py`**: Registered `UserProfile` in Django admin
- **`api/serializers.py`**: Updated `RegisterSerializer` + Added `LoginSerializer`
- **`api/views.py`**: 
  - Updated `register()` view with token generation
  - Added `login()` view for authentication
  - Added `get_roles()` view to fetch available roles
- **`api/urls.py`**: Added routes for login and roles
- **`backend/settings.py`**: Added `rest_framework.authtoken` to INSTALLED_APPS

### 3. **Backend API Endpoints**

#### Register Endpoint
```
POST /api/register/
```

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "password2": "SecurePassword123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "operator"
}
```

#### Login Endpoint
```
POST /api/login/
```

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "SecurePassword123"
}
```

**Response (Success - 200):**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "operator",
    "token": "auth-token-here",
    "message": "Login successful as Operator"
}
```

**Valid Roles:**
- `operator` - Operator role
- `admin` - Admin role
- `analyst` - Analyst role

**Response (Success - 201):**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "operator",
    "message": "User registered successfully as Operator"
}
```

#### Get Roles Endpoint
```
GET /api/roles/
```

**Response:**
```json
{
    "roles": [
        {"value": "operator", "label": "Operator"},
        {"value": "admin", "label": "Admin"},
        {"value": "analyst", "label": "Analyst"}
    ]
}
```

## Frontend Setup

### 1. **Frontend File Changes**

The React component `components/LoginSignup/loginsignup.jsx` was updated to:

- Add role state management for both login and signup forms
- Include a role dropdown selector
- Send the `role` parameter to the backend registration endpoint
- Update the API endpoint to `http://localhost:8000/api/register/`
- Convert role display names to lowercase values for the API

### 2. **Signup Form**

The signup form now includes:
- Username field
- Email field
- Password field
- Confirm Password field
- **Role dropdown** (Operator, Analyst, Admin)

### 3. **Testing the Registration**

1. **Start Django backend:**
   ```powershell
   cd c:\Users\YASHTI\Desktop\INFOSYS\pro\BACKEND\backend
   python manage.py runserver
   ```

2. **Start React frontend:**
   ```powershell
   cd c:\Users\YASHTI\Desktop\INFOSYS\pro\FRONTEND\login-signup\login-signup
   npm start
   ```

3. **Test Registration:**
   - Navigate to the signup form
   - Fill in the form with:
     - Username: `testuser`
     - Email: `test@example.com`
     - Password: `TestPass123`
     - Confirm Password: `TestPass123`
     - Role: Select from dropdown (Operator, Analyst, or Admin)
   - Click "Sign Up"

### 4. **Verify in Django Admin**

1. Go to `http://localhost:8000/admin/`
2. Log in with superuser credentials
3. Navigate to "User Profiles" to see registered users and their roles

## Database Structure

### UserProfile Model

```
- id: Primary Key
- user: OneToOne relationship to Django User
- role: CharField with choices (operator, admin, analyst)
- created_at: DateTime (auto-created)
- updated_at: DateTime (auto-updated)
```

## Testing Examples

### Example 1: Register as Operator
```
POST http://localhost:8000/api/register/
{
    "username": "operator1",
    "email": "op@example.com",
    "password": "OpPass123",
    "password2": "OpPass123",
    "role": "operator"
}
```

### Example 2: Register as Admin
```
POST http://localhost:8000/api/register/
{
    "username": "admin1",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "password2": "AdminPass123",
    "role": "admin"
}
```

### Example 3: Register as Analyst
```
POST http://localhost:8000/api/register/
{
    "username": "analyst1",
    "email": "analyst@example.com",
    "password": "AnalystPass123",
    "password2": "AnalystPass123",
    "role": "analyst"
}
```

## Error Handling

The system handles the following errors:

1. **Mismatched Passwords**: Returns 400 with error message
2. **Username Already Exists**: Returns 400 with error message
3. **Email Already Exists**: Returns 400 with error message
4. **Invalid Role**: Returns 400 with error message
5. **Missing Required Fields**: Returns 400 with validation errors

## Next Steps

1. Implement login endpoint with role-based authentication
2. Add role-based middleware for authorization
3. Add user profile update endpoint
4. Implement role-based dashboard views
5. Add JWT token-based authentication

