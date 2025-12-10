from django.urls import path
from .views import hello, register, login, get_roles

urlpatterns = [
    path('hello/', hello),
    path('register/', register),
    path('login/', login),
    path('roles/', get_roles),
]
