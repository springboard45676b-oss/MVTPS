# PostgreSQL Database Configuration for MVTPS
# Add this to your MVTPS/backend/mvtps/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mvtps_db',
        'USER': 'mvtps_user',
        'PASSWORD': 'your_password_here',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Required package: pip install psycopg2-binary