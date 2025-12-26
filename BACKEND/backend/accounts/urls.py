# accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts import views
from .views import user_profile

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.get_user_profile, name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', user_profile),
]