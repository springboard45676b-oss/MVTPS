# coreapi/urls.py
from django.urls import path
from .views import PortListCreateView

urlpatterns = [
    path('ports/', PortListCreateView.as_view(), name='ports-list'),
]
