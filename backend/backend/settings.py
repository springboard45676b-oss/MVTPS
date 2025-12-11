from pathlib import Path
from datetime import timedelta

# -------------------------
# BASE DIR
# -------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------
# SECRET + DEBUG
# -------------------------
SECRET_KEY = "dev-secret-key"  # Change in production!
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# -------------------------
# INSTALLED APPS
# -------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",

    "api",
]

# -------------------------
# MIDDLEWARE
# -------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -------------------------
# CORS (DEV ONLY)
# -------------------------
CORS_ALLOW_ALL_ORIGINS = True

# -------------------------
# ROOT URL
# -------------------------
ROOT_URLCONF = "backend.urls"

# -------------------------
# TEMPLATES
# -------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# -------------------------
# WSGI
# -------------------------
WSGI_APPLICATION = "backend.wsgi.application"

# -------------------------
# DATABASE
# -------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# -------------------------
# AUTH
# -------------------------
AUTH_USER_MODEL = "api.User"  # Custom user with roles
AUTH_PASSWORD_VALIDATORS = []

# -------------------------
# LANGUAGE / TIMEZONE
# -------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -------------------------
# STATIC
# -------------------------
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -------------------------
# REST FRAMEWORK + JWT
# -------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,           # Optional: rotate refresh tokens
    "BLACKLIST_AFTER_ROTATION": True,        # Optional: blacklist used refresh tokens
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}
