"""
Serializers Package
Organized serializers matching the views structure
"""

# Core utilities
from .utils import PositionCalculator

# User/Auth serializers
from .auth_serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
)

# Vessel serializers
from .vessel_serializers import (
    VesselSerializer,
    VesselPositionSerializer,
    VesselDetailedSerializer,
)

# Notification serializers
from .notification_serializers import (
    NotificationSerializer,
    VesselSubscriptionSerializer,
    VesselAlertSerializer,
)

# Port serializers
from .port_serializers import (
    PortSerializer,
    PortDetailedSerializer,
)

# Voyage serializers
from .voyage_serializers import (
    VoyageSerializer,
    VoyageDetailedSerializer,
)

# Safety serializers
from .safety_serializers import (
    PiracyZoneSerializer,
    CountrySerializer,
    WeatherAlertSerializer,
)

# Admin serializers
from .admin_serializers import (
    UserActionSerializer,
)

__all__ = [
    # Utils
    'PositionCalculator',
    
    # Auth
    'UserSerializer',
    'CustomTokenObtainPairSerializer',
    'RegisterSerializer',
    'UserProfileUpdateSerializer',
    
    # Vessels
    'VesselSerializer',
    'VesselPositionSerializer',
    'VesselDetailedSerializer',
    
    # Notifications
    'NotificationSerializer',
    'VesselSubscriptionSerializer',
    'VesselAlertSerializer',
    
    # Ports
    'PortSerializer',
    'PortDetailedSerializer',
    
    # Voyages
    'VoyageSerializer',
    'VoyageDetailedSerializer',
    
    # Safety
    'PiracyZoneSerializer',
    'CountrySerializer',
    'WeatherAlertSerializer',
    
    # Admin
    'UserActionSerializer',
]