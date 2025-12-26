from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VesselViewSet, VesselPositionViewSet, VoyageViewSet
from .real_time_views import LiveVesselPositionsView, MarineWeatherView, VesselDetailsView

router = DefaultRouter()
router.register(r'vessels', VesselViewSet)
router.register(r'positions', VesselPositionViewSet)
router.register(r'voyages', VoyageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('live-positions/', LiveVesselPositionsView.as_view(), name='live-positions'),
    path('marine-weather/', MarineWeatherView.as_view(), name='marine-weather'),
    path('vessel-details/<str:mmsi>/', VesselDetailsView.as_view(), name='vessel-details'),
]