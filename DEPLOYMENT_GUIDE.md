# Milestone 4 - Deployment Guide

## Architecture Overview

### Backend (Django)
- **Framework**: Django 4.x + Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **APIs**: RESTful APIs with role-based access control

### Frontend (React)
- **Framework**: React 18.x
- **UI Library**: Material-UI
- **Charts**: Recharts
- **Maps**: React-Leaflet
- **State Management**: React Hooks

### Role-Based Access Control
- **Admin**: Full system access, API management, data export
- **Company**: Fleet management, voyage tracking, compliance
- **Port Authority**: Port operations, congestion monitoring
- **Insurer**: Risk assessment, compliance auditing

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Generate mock data
python manage.py generate_voyage_data
python manage.py populate_safety_data

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend/vessel-frontend

# Install dependencies
npm install

# Start development server
npm start
```

## API Endpoints

### Voyage Replay
- `GET /api/vessels/voyage-replay/` - List voyages
- `GET /api/vessels/voyage-replay/{id}/replay_data/` - Get replay data
- `GET /api/vessels/voyage-replay/vessels/` - List vessels with voyages

### Dashboards
- `GET /api/analytics/company-dashboard/` - Company analytics
- `GET /api/analytics/port-authority-dashboard/` - Port authority analytics
- `GET /api/analytics/insurer-dashboard/` - Insurer analytics

### Admin Tools
- `GET /api/admin-tools/api-sources/` - List API sources
- `POST /api/admin-tools/api-sources/{id}/toggle_status/` - Enable/disable source
- `GET /api/admin-tools/export/voyage_data/?format=csv` - Export voyages
- `GET /api/admin-tools/export/congestion_data/?format=json` - Export congestion

## Production Deployment

### Backend (Django)

1. **Environment Variables** (.env):
```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

2. **Collect Static Files**:
```bash
python manage.py collectstatic
```

3. **Use Gunicorn**:
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

4. **Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/staticfiles/;
    }
}
```

### Frontend (React)

1. **Build for Production**:
```bash
npm run build
```

2. **Serve with Nginx**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

## Docker Deployment (Optional)

### Dockerfile (Backend)
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mvtps
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/mvtps

  frontend:
    build: ./frontend/vessel-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
npm test
```

## Monitoring

- Use Django logging for backend errors
- Use Sentry for error tracking
- Monitor API performance with Django Debug Toolbar (development)
- Use Prometheus + Grafana for production monitoring

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use HTTPS (SSL/TLS)
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] API key rotation

## Performance Optimization

- Enable database query optimization
- Use Redis for caching
- Implement CDN for static files
- Enable gzip compression
- Optimize database indexes
- Use connection pooling

## Folder Structure

```
MVTPS/
├── backend/
│   ├── vessels/
│   │   ├── voyage_models.py (NEW)
│   │   ├── voyage_serializers.py (NEW)
│   │   ├── voyage_views.py (NEW)
│   │   └── management/commands/
│   │       └── generate_voyage_data.py (NEW)
│   ├── analytics/
│   │   └── dashboard_views.py (NEW)
│   ├── admin_tools/
│   │   ├── admin_models.py (NEW)
│   │   └── admin_views.py (NEW)
│   └── manage.py
├── frontend/vessel-frontend/
│   └── src/
│       ├── pages/
│       │   ├── HistoricalVoyageReplay.js (NEW)
│       │   ├── CompanyDashboard.js (NEW)
│       │   └── AdminTools.js (NEW)
│       └── App.js (UPDATED)
└── .gitignore
```

## Support

For issues or questions, refer to the project documentation.
