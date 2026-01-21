# server/core/urls.py - Complete with User Action Logging and Admin Endpoints

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import (
    api_root,
    # Authentication views
    RegisterAPI,
    CustomTokenObtainPairView,
    UserProfileAPI,
    UserProfileUpdateAPI,
    # Vessel views
    VesselListCreateAPI,
    VesselDetailAPI,
    VesselPositionHistoryAPI,
    VesselCurrentPositionAPI,
    VesselStatsAPI,
    UpdateVesselPositionAPI,
    GenerateRealisticMockDataAPI,
    BulkVesselPositionsAPI,
    # Subscription & Alert views
    UserVesselSubscriptionsAPI,
    VesselSubscriptionDetailAPI,
    UserAlertsAPI,
    AlertMarkAsReadAPI,
    # Notification views
    UserNotificationsAPI,
    NotificationDetailAPI,
    MarkNotificationAsReadAPI,
    MarkAllNotificationsAsReadAPI,
    ClearAllNotificationsAPI,
    DeleteNotificationAPI,
    # Port views
    PortListAPI,
    PortDetailAPI,
    PortStatisticsAPI,
    # Voyage views
    VoyageListAPI,
    VoyageDetailAPI,
    VoyagesByVesselAPI,
    VoyagesByPortAPI,
    ActiveVoyagesAPI,
    # Mock data generation
    GeneratePortVoyageMockDataAPI,
    PiracyZoneListAPI,
    CountryViewSet,  # ViewSet for countries
    WeatherAlertListAPI,
    # User Action Logging Views
    UserActionViewSet,
    # Dashboard Views
    company_dashboard,
    port_dashboard,
    insurer_dashboard,
    # Admin Views - ADD THESE IMPORTS
    AdminUserViewSet,
    admin_system_info,
    admin_export_data,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/user-actions', UserActionViewSet, basename='user-actions')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')  # NEW - Admin User Management
router.register(r'countries', CountryViewSet, basename='countries')

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # ============================================
    # ROUTER URLS (ViewSets)
    # ============================================
    path('', include(router.urls)),
    
    # ============================================
    # AUTHENTICATION ENDPOINTS - /api/auth/*
    # ============================================
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    # path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    

    path('auth/login/', TokenObtainPairView.as_view(), name='login'),

    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileAPI.as_view(), name='user-profile'),
    path('auth/profile/edit/', UserProfileUpdateAPI.as_view(), name='user-profile-edit'),
    
    # ============================================
    # VESSEL ENDPOINTS - /api/vessels/*
    # ============================================
    path('vessels/', VesselListCreateAPI.as_view(), name='vessel-list-create'),
    path('vessels/<int:pk>/', VesselDetailAPI.as_view(), name='vessel-detail'),
    path('vessels/<int:vessel_id>/positions/', VesselPositionHistoryAPI.as_view(), name='vessel-positions'),
    path('vessels/<int:vessel_id>/current-position/', VesselCurrentPositionAPI.as_view(), name='vessel-current-position'),
    path('vessels/<int:vessel_id>/stats/', VesselStatsAPI.as_view(), name='vessel-stats'),
    path('vessels/<int:vessel_id>/update-position/', UpdateVesselPositionAPI.as_view(), name='update-vessel-position'),
    path('vessels/bulk/current-positions/', BulkVesselPositionsAPI.as_view(), name='bulk-vessel-positions'),
    
    # ============================================
    # PORT ENDPOINTS - /api/ports/*
    # ============================================
    path('ports/', PortListAPI.as_view(), name='port-list'),
    path('ports/<int:pk>/', PortDetailAPI.as_view(), name='port-detail'),
    path('ports/<int:port_id>/statistics/', PortStatisticsAPI.as_view(), name='port-statistics'),
    
    # ============================================
    # VOYAGE ENDPOINTS - /api/voyages/*
    # ============================================
    path('voyages/', VoyageListAPI.as_view(), name='voyage-list'),
    path('voyages/<int:pk>/', VoyageDetailAPI.as_view(), name='voyage-detail'),
    path('voyages/vessel/<int:vessel_id>/', VoyagesByVesselAPI.as_view(), name='voyages-by-vessel'),
    path('voyages/port/<int:port_id>/', VoyagesByPortAPI.as_view(), name='voyages-by-port'),
    path('voyages/active/', ActiveVoyagesAPI.as_view(), name='active-voyages'),
    
    # ============================================
    # SUBSCRIPTION & ALERT ENDPOINTS - /api/users/*
    # ============================================
    path('users/subscriptions/', UserVesselSubscriptionsAPI.as_view(), name='user-subscriptions'),
    path('users/subscriptions/<int:pk>/', VesselSubscriptionDetailAPI.as_view(), name='subscription-detail'),
    path('users/alerts/', UserAlertsAPI.as_view(), name='user-alerts'),
    path('alerts/<int:alert_id>/mark-read/', AlertMarkAsReadAPI.as_view(), name='mark-alert-read'),
    
    # ============================================
    # NOTIFICATION ENDPOINTS - /api/users/notifications/*
    # ============================================
    path('users/notifications/', UserNotificationsAPI.as_view(), name='user-notifications-list'),
    path('users/notifications/<int:pk>/', NotificationDetailAPI.as_view(), name='notification-detail'),
    path('users/notifications/<int:notification_id>/mark-read/', MarkNotificationAsReadAPI.as_view(), name='mark-notification-read'),
    path('users/notifications/mark-all-read/', MarkAllNotificationsAsReadAPI.as_view(), name='mark-all-notifications-read'),
    path('users/notifications/<int:notification_id>/delete/', DeleteNotificationAPI.as_view(), name='delete-notification'),
    path('users/notifications/clear-all/', ClearAllNotificationsAPI.as_view(), name='clear-all-notifications'),
    
    # ============================================
    # PIRACY ZONES ENDPOINT - /api/piracy-zones/
    # ============================================
    path('piracy-zones/', PiracyZoneListAPI.as_view(), name='piracy-zones'),
    
    # ============================================
    # WEATHER ALERTS ENDPOINT - /api/weather-alerts/
    # ============================================
    path('weather-alerts/', WeatherAlertListAPI.as_view(), name='weather-alerts'),
    
    # ============================================
    # DASHBOARD ENDPOINTS - /api/dashboard/*
    # ============================================
    path('dashboard/company/', company_dashboard, name='company-dashboard'),
    path('dashboard/port/', port_dashboard, name='port-dashboard'),
    path('dashboard/insurer/', insurer_dashboard, name='insurer-dashboard'),
    
    # ============================================
    # ADMIN ENDPOINTS - /api/admin/* (NEW SECTION)
    # ============================================
    # Note: User CRUD endpoints are auto-registered by router at /api/admin/users/
    # Available endpoints:
    # GET    /api/admin/users/                     - List all users
    # POST   /api/admin/users/                     - Create user
    # GET    /api/admin/users/{id}/                - Get user detail
    # PUT    /api/admin/users/{id}/                - Update user
    # DELETE /api/admin/users/{id}/                - Delete user
    # POST   /api/admin/users/{id}/activate/       - Activate user
    # POST   /api/admin/users/{id}/deactivate/     - Deactivate user
    # POST   /api/admin/users/{id}/change_role/    - Change user role
    # POST   /api/admin/users/{id}/reset_password/ - Reset password
    
    path('admin/system-info/', admin_system_info, name='admin-system-info'),
    path('admin/export/', admin_export_data, name='admin-export'),
    
    # ============================================
    # MOCK DATA GENERATION - /api/*
    # ============================================
    path('generate-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-mock-data'),
    path('generate-realistic-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-realistic-mock-data'),
    path('generate-port-voyage-mock-data/', GeneratePortVoyageMockDataAPI.as_view(), name='generate-port-voyage-mock-data'),
]