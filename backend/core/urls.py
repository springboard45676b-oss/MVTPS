from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from coreapi.views import VesselViewSet, PortViewSet, AlertEventViewSet

# Milestone 2 & 3: Automatic URL routing
router = DefaultRouter()
router.register(r'vessels', VesselViewSet)
router.register(r'ports', PortViewSet)
router.register(r'alerts', AlertEventViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Milestone 1: Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Milestone 2, 3, 4: Data Endpoints
    path('api/', include(router.urls)),
]