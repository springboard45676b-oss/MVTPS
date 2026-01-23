"""
Core URL Configuration
All API routes (prefixed with /api/ by backend)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    api_root,
    RegisterAPI,
    CustomTokenObtainPairView,
    UserProfileAPI,
    UserProfileUpdateAPI,
    VesselListCreateAPI,
    VesselDetailAPI,
    VesselPositionHistoryAPI,
    VesselCurrentPositionAPI,
    VesselStatsAPI,
    UpdateVesselPositionAPI,
    BulkVesselPositionsAPI,
    GenerateRealisticMockDataAPI,
    UserNotificationsAPI,
    NotificationDetailAPI,
    MarkNotificationAsReadAPI,
    MarkAllNotificationsAsReadAPI,
    ClearAllNotificationsAPI,
    DeleteNotificationAPI,
    UserVesselSubscriptionsAPI,
    VesselSubscriptionDetailAPI,
    UserAlertsAPI,
    AlertMarkAsReadAPI,
    PortListAPI,
    PortDetailAPI,
    GeneratePortVoyageMockDataAPI,
    VoyageListAPI,
    VoyageDetailAPI,
    PiracyZoneListAPI,
    WeatherAlertListAPI,
    CountryViewSet,
    company_dashboard,
    port_dashboard,
    insurer_dashboard,
    AdminUserViewSet,
    UserActionViewSet,
    admin_system_info,
    admin_export_data,
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/user-actions', UserActionViewSet, basename='user-actions')
router.register(r'countries', CountryViewSet, basename='countries')

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # Router URLs
    path('', include(router.urls)),
    
    # ========== AUTHENTICATION ==========
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/profile/', UserProfileAPI.as_view(), name='user-profile'),
    path('auth/profile/edit/', UserProfileUpdateAPI.as_view(), name='user-profile-edit'),
    
    # ========== VESSELS ==========
    path('vessels/', VesselListCreateAPI.as_view(), name='vessel-list'),
    path('vessels/<int:pk>/', VesselDetailAPI.as_view(), name='vessel-detail'),
    path('vessels/<int:vessel_id>/positions/', VesselPositionHistoryAPI.as_view(), name='vessel-positions'),
    path('vessels/<int:vessel_id>/current-position/', VesselCurrentPositionAPI.as_view(), name='vessel-current-position'),
    path('vessels/<int:vessel_id>/stats/', VesselStatsAPI.as_view(), name='vessel-stats'),
    path('vessels/<int:vessel_id>/update-position/', UpdateVesselPositionAPI.as_view(), name='update-position'),
    path('vessels/bulk/current-positions/', BulkVesselPositionsAPI.as_view(), name='bulk-positions'),
    
    # ========== NOTIFICATIONS ==========
    path('users/notifications/', UserNotificationsAPI.as_view(), name='notifications-list'),
    path('users/notifications/<int:pk>/', NotificationDetailAPI.as_view(), name='notification-detail'),
    path('users/notifications/<int:notification_id>/mark-read/', MarkNotificationAsReadAPI.as_view(), name='notification-mark-read'),
    path('users/notifications/mark-all-read/', MarkAllNotificationsAsReadAPI.as_view(), name='notifications-mark-all-read'),
    path('users/notifications/<int:notification_id>/delete/', DeleteNotificationAPI.as_view(), name='notification-delete'),
    path('users/notifications/clear-all/', ClearAllNotificationsAPI.as_view(), name='notifications-clear-all'),
    
    # ========== SUBSCRIPTIONS & ALERTS ==========
    path('users/subscriptions/', UserVesselSubscriptionsAPI.as_view(), name='subscriptions-list'),
    path('users/subscriptions/<int:pk>/', VesselSubscriptionDetailAPI.as_view(), name='subscription-detail'),
    path('users/alerts/', UserAlertsAPI.as_view(), name='alerts-list'),
    path('alerts/<int:alert_id>/mark-read/', AlertMarkAsReadAPI.as_view(), name='alert-mark-read'),
    
    # ========== PORTS ==========
    path('ports/', PortListAPI.as_view(), name='port-list'),
    path('ports/<int:pk>/', PortDetailAPI.as_view(), name='port-detail'),
    
    # ========== VOYAGES ==========
    path('voyages/', VoyageListAPI.as_view(), name='voyage-list'),
    path('voyages/<int:pk>/', VoyageDetailAPI.as_view(), name='voyage-detail'),
    
    # ========== SAFETY ==========
    path('piracy-zones/', PiracyZoneListAPI.as_view(), name='piracy-zones'),
    path('weather-alerts/', WeatherAlertListAPI.as_view(), name='weather-alerts'),
    
    # ========== DASHBOARDS ==========
    path('dashboard/company/', company_dashboard, name='dashboard-company'),
    path('dashboard/port/', port_dashboard, name='dashboard-port'),
    path('dashboard/insurer/', insurer_dashboard, name='dashboard-insurer'),
    
    # ========== ADMIN ==========
    path('admin/system-info/', admin_system_info, name='admin-system-info'),
    path('admin/export/', admin_export_data, name='admin-export'),
    
    # ========== MOCK DATA ==========
    path('generate-realistic-mock-data/', GenerateRealisticMockDataAPI.as_view(), name='generate-mock-data'),
    path('generate-port-voyage-mock-data/', GeneratePortVoyageMockDataAPI.as_view(), name='generate-port-voyage-data'),
]