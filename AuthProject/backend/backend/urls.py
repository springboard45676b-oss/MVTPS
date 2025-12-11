from django.contrib import admin
from django.urls import path
from api.views import CreateUserView, RoleDashboardView, VesselListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('api/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # Feature Endpoints
    path('api/dashboard/', RoleDashboardView.as_view(), name='dashboard'),
    path('api/vessels/', VesselListView.as_view(), name='vessel-list'), # <--- NEW
]