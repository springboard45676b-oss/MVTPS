from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortViewSet, PortCongestionViewSet
from .congestion_views import (
    PortCongestionAnalyticsView,
    CongestionAlertsView,
    PortThroughputAnalyticsView
)

router = DefaultRouter()
router.register(r'ports', PortViewSet)
router.register(r'congestion', PortCongestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/', PortCongestionAnalyticsView.as_view(), name='port-analytics'),
    path('alerts/', CongestionAlertsView.as_view(), name='congestion-alerts'),
    path('throughput/', PortThroughputAnalyticsView.as_view(), name='port-throughput'),
]