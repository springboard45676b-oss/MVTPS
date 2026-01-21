from django.contrib import admin
from django.urls import path
from api.views import CreateUserView, RoleDashboardView, VesselListView, port_analytics_view, VoyageListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import VesselListView  # This is likely the correct existing view
from api.views import VesselHistoryView

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('api/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # Feature Endpoints
    path('api/dashboard/', RoleDashboardView.as_view(), name='dashboard'),
    path('api/vessels/', VesselListView.as_view(), name='vessel-list'),
    
    # UNCTAD Analytics Endpoint
    path('api/port-stats/', port_analytics_view, name='port-stats'), # <--- NEW

    path('api/voyages/', VoyageListView.as_view(), name='voyage-list'),
    path('api/history/<int:pk>/', VesselHistoryView.as_view(), name='vessel-history'),
]