from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView,
    PortViewSet, VesselViewSet, VoyageViewSet, EventViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'ports', PortViewSet)
router.register(r'vessels', VesselViewSet)
router.register(r'voyages', VoyageViewSet)
router.register(r'events', EventViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    
    # User Profile
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # API Routes
    path('', include(router.urls)),
]