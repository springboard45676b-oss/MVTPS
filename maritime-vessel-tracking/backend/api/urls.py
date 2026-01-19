"""
API URL Configuration for Maritime Vessel Tracking Platform.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Auth views
    RegisterView, LoginView, LogoutView, ProfileView, ChangePasswordView,
    # ViewSets
    VesselViewSet, PortViewSet, VoyageViewSet, SafetyZoneViewSet,
    EventViewSet, NotificationViewSet, UserViewSet, APISourceViewSet,
    SystemLogViewSet,
    # Other views
    DashboardView, SystemHealthView,
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'vessels', VesselViewSet, basename='vessel')
router.register(r'ports', PortViewSet, basename='port')
router.register(r'voyages', VoyageViewSet, basename='voyage')
router.register(r'safety-zones', SafetyZoneViewSet, basename='safety-zone')
router.register(r'events', EventViewSet, basename='event')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserViewSet, basename='user')
router.register(r'api-sources', APISourceViewSet, basename='api-source')
router.register(r'logs', SystemLogViewSet, basename='log')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard/stats/', DashboardView.as_view(), name='dashboard_stats'),
    
    # System
    path('system/health/', SystemHealthView.as_view(), name='system_health'),
    
    # Router URLs
    path('', include(router.urls)),
]