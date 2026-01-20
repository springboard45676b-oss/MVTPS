from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('users/', views.user_list, name='user-list'),
    path('users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('users/stats/', views.user_stats, name='user-stats'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]