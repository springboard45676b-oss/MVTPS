"""URL configuration for backend project."""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import api_root

router = DefaultRouter()
# register viewsets here later, for example:
# from core.views import VesselViewSet
# router.register('vessels', VesselViewSet)

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api-root'),
    
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include([
        # JWT Authentication endpoints
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
        # Other auth endpoints
        path('auth/', include('core.urls')),
        
        # Other API endpoints (for future viewsets)
        path('', include(router.urls)),
    ])),
]