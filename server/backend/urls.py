"""URL configuration for backend project."""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import api_root

router = DefaultRouter()

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api-root'),
    
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include([
        # JWT Authentication endpoints (keep at root level)
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
        # Include all core URLs (auth, vessels, positions, etc.)
        # This puts endpoints like /api/auth/register/, /api/vessels/, etc.
        path('', include('core.urls')),
        
        # Router for future viewsets
        path('', include(router.urls)),
    ])),
]