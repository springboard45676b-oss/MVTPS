# server/core/urls.py - Replace your existing urls.py with this

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
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
    # Port views - NEW
    PortListAPI,
    PortDetailAPI,
    PortStatisticsAPI,
    # Voyage views - NEW
    VoyageListAPI,
    VoyageDetailAPI,
    VoyagesByVesselAPI,
    VoyagesByPortAPI,
    ActiveVoyagesAPI,
    # Mock data generation
    GeneratePortVoyageMockDataAPI,
)

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # ============================================
    # AUTHENTICATION ENDPOINTS - /api/auth/*
    # ============================================
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
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
    # MOCK DATA GENERATION - /api/*
    # ============================================
    path('generate-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-mock-data'),
    path('generate-realistic-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-realistic-mock-data'),
    path('generate-port-voyage-mock-data/', GeneratePortVoyageMockDataAPI.as_view(), name='generate-port-voyage-mock-data'),
]