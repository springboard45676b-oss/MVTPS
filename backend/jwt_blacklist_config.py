# Add to requirements.txt
djangorestframework-simplejwt[crypto]==5.3.0

# Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    # ... existing apps
    "rest_framework_simplejwt.token_blacklist",
]

# Enhanced JWT settings with blacklist
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,  # CRITICAL: Enable blacklist
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",  # Required for blacklist
}