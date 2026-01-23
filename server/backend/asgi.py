"""
ASGI config for backend project.
Uvicorn compatible with WebSocket support via Django Channels
"""
import os
import django
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django FIRST - this is critical!
django.setup()

# Get Django ASGI application for HTTP
django_asgi_app = get_asgi_application()

# Import after Django setup - these need Django to be configured
try:
    from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
    from channels.security.websocket import AllowedHostsOriginValidator # type: ignore
    from core.routing import websocket_urlpatterns
    from core.middleware import TokenAuthMiddlewareStack

    # ASGI application - routes HTTP and WebSocket
    application = ProtocolTypeRouter({
        # HTTP requests
        "http": django_asgi_app,
        
        # WebSocket connections
        "websocket": AllowedHostsOriginValidator(
            TokenAuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        ),
    })
except ImportError:
    # Fallback if Channels is not installed (HTTP only)
    application = django_asgi_app