"""
Django settings for backend project.
Works for both local development and production (Render)
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ===============================
# ENVIRONMENT DETECTION
# ===============================
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

# ===============================
# SECURITY
# ===============================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-for-development-only')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# ALLOWED_HOSTS - works for both local and production
ALLOWED_HOSTS = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1'
).split(',')

# Add port variants for local development
if not IS_PRODUCTION:
    ALLOWED_HOSTS.extend([
        '127.0.0.1:8000',
        '127.0.0.1:3000',
        '127.0.0.1:5173',
        'localhost:8000',
        'localhost:3000',
        'localhost:5173',
    ])

# ===============================
# APPLICATIONS
# ===============================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'channels',
    # Local apps
    'core',
]

# ===============================
# MIDDLEWARE
# ===============================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

# Add WhiteNoise for production static files
if IS_PRODUCTION:
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')

MIDDLEWARE.extend([
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.UserActionLoggingMiddleware',
])

# ===============================
# URL / TEMPLATES
# ===============================
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ===============================
# ASGI / CHANNELS
# ===============================
ASGI_APPLICATION = 'backend.asgi.application'

# Channel Layers - In-Memory for local, Redis for production
if IS_PRODUCTION:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [os.getenv('REDIS_URL', 'redis://localhost:6379')],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer'
        }
    }

# ===============================
# DATABASE
# ===============================
if IS_PRODUCTION and os.getenv('DATABASE_URL'):
    # Production: Use DATABASE_URL from Render
    import dj_database_url # type: ignore
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    # Local: Use PostgreSQL with .env credentials
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'vesseltracking'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# ===============================
# PASSWORD VALIDATION
# ===============================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===============================
# INTERNATIONALIZATION
# ===============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ===============================
# DJANGO REST FRAMEWORK
# ===============================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.JSONParser',
    ],
}

# ===============================
# JWT SETTINGS
# ===============================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ===============================
# CORS SETTINGS
# ===============================
CORS_ALLOW_CREDENTIALS = True

# Get CORS origins from environment or use defaults
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
if cors_origins and cors_origins[0]:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins]
else:
    # Default for local development
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

# Allow all origins in development (optional)
if not IS_PRODUCTION and DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# ===============================
# CUSTOM USER MODEL
# ===============================
AUTH_USER_MODEL = 'core.User'

# ===============================
# STATIC FILES
# ===============================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Use WhiteNoise for production static files
if IS_PRODUCTION:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ===============================
# DEFAULT PRIMARY KEY
# ===============================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===============================
# LOGGING
# ===============================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO' if IS_PRODUCTION else 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'uvicorn': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}