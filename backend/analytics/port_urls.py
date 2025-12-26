# Add to MVTPS/backend/analytics/urls.py

from django.urls import path
from . import port_analytics_views

urlpatterns = [
    # Existing analytics URLs...
    
    # UNCTAD Port Analytics URLs
    path('port-congestion/', port_analytics_views.port_congestion_analytics, name='port_congestion_analytics'),
    path('port-trends/', port_analytics_views.port_trends_analytics, name='port_trends_analytics'),
    path('global-shipping/', port_analytics_views.global_shipping_overview, name='global_shipping_overview'),
    path('port-efficiency/', port_analytics_views.port_efficiency_rankings, name='port_efficiency_rankings'),
]