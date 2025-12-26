from django.urls import path
from .views import hello, register, login, get_roles, vessel_list, vessel_positions, user_profile, change_password

urlpatterns = [
    path('hello/', hello),
    path('register/', register),
    path('login/', login),
    path('roles/', get_roles),
    path('vessels/', vessel_list),
    path('vessels/<str:imo_number>/positions/', vessel_positions),
    path('me/', user_profile),
    path('change-password/', change_password),

]
