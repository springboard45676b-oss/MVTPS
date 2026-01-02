from django.urls import path
from .views import port_list

urlpatterns = [
    path('', port_list, name='port-list'),
]
