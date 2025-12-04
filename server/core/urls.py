from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterAPI,
    ProfileAPI,
    CustomTokenObtainPairView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoint
    path('profile/', ProfileAPI.as_view(), name='profile'),
]
