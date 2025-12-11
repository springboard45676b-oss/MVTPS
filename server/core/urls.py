from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterAPI,
    CustomTokenObtainPairView,
    UserProfileAPI,
    UserProfileUpdateAPI
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', UserProfileAPI.as_view(), name='user-profile'),
    path('profile/edit/', UserProfileUpdateAPI.as_view(), name='user-profile-edit'),
]