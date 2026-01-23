"""
Core Views Package
Organized into logical modules for better maintainability
"""

# Import all views from submodules
from .auth_views import (
    RegisterAPI,
    CustomTokenObtainPairView,
    UserProfileAPI,
    UserProfileUpdateAPI,
    api_root,
)

from .vessel_views import (
    VesselListCreateAPI,
    VesselDetailAPI,
    VesselPositionHistoryAPI,
    VesselCurrentPositionAPI,
    VesselStatsAPI,
    UpdateVesselPositionAPI,
    BulkVesselPositionsAPI,
    GenerateRealisticMockDataAPI,
)

from .notification_views import (
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
)

from .port_views import (
    PortListAPI,
    PortDetailAPI,
    GeneratePortVoyageMockDataAPI,
)

from .voyage_views import (
    VoyageListAPI,
    VoyageDetailAPI,
)

from .admin_views import (
    AdminUserViewSet,
    UserActionViewSet,
    admin_system_info,
    admin_export_data,
)

from .dashboard_views import (
    company_dashboard,
    port_dashboard,
    insurer_dashboard,
)

# Safety data views
from .safety_views import (
    PiracyZoneListAPI,
    CountryViewSet,
    WeatherAlertListAPI,
)

__all__ = [
    # Auth
    'RegisterAPI',
    'CustomTokenObtainPairView',
    'UserProfileAPI',
    'UserProfileUpdateAPI',
    'api_root',
    
    # Vessels
    'VesselListCreateAPI',
    'VesselDetailAPI',
    'VesselPositionHistoryAPI',
    'VesselCurrentPositionAPI',
    'VesselStatsAPI',
    'UpdateVesselPositionAPI',
    'BulkVesselPositionsAPI',
    'GenerateRealisticMockDataAPI',
    
    # Notifications
    'UserNotificationsAPI',
    'NotificationDetailAPI',
    'MarkNotificationAsReadAPI',
    'MarkAllNotificationsAsReadAPI',
    'ClearAllNotificationsAPI',
    'DeleteNotificationAPI',
    'UserVesselSubscriptionsAPI',
    'VesselSubscriptionDetailAPI',
    'UserAlertsAPI',
    'AlertMarkAsReadAPI',
    
    # Ports
    'PortListAPI',
    'PortDetailAPI',
    'GeneratePortVoyageMockDataAPI',
    
    # Voyages
    'VoyageListAPI',
    'VoyageDetailAPI',
    
    # Admin
    'AdminUserViewSet',
    'UserActionViewSet',
    'admin_system_info',
    'admin_export_data',
    
    # Dashboards
    'company_dashboard',
    'port_dashboard',
    'insurer_dashboard',
    
    # Safety
    'PiracyZoneListAPI',
    'CountryViewSet',
    'WeatherAlertListAPI',
]