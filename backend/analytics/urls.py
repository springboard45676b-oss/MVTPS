from django.urls import path
from . import views

urlpatterns = [
    path('voyages/', views.VoyageListView.as_view(), name='voyage-list'),
    path('voyages/<int:pk>/', views.VoyageDetailView.as_view(), name='voyage-detail'),
    path('dashboard/', views.analytics_dashboard, name='analytics-dashboard'),
    path('vessels/', views.vessel_analytics, name='vessel-analytics'),
    path('ports/', views.port_analytics, name='port-analytics'),
    path('fleet-composition/', views.fleet_composition, name='fleet-composition'),
]