from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
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
)

urlpatterns = [
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
    # SUBSCRIPTION & ALERT ENDPOINTS - /api/users/*
    # ============================================
    path('users/subscriptions/', UserVesselSubscriptionsAPI.as_view(), name='user-subscriptions'),
    path('users/subscriptions/<int:pk>/', VesselSubscriptionDetailAPI.as_view(), name='subscription-detail'),
    path('users/alerts/', UserAlertsAPI.as_view(), name='user-alerts'),
    path('alerts/<int:alert_id>/mark-read/', AlertMarkAsReadAPI.as_view(), name='mark-alert-read'),
    
    # ============================================
    # DATA GENERATION - /api/*
    # ============================================
    path('generate-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-mock-data'),
    path('generate-realistic-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-realistic-mock-data'),
]