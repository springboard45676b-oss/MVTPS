from django.urls import path
from .views import PortListCreateView
from tracking.views import LiveVesselView

urlpatterns = [
    path('ports/', PortListCreateView.as_view(), name='ports-list'),
    path("vessels/live/", LiveVesselView.as_view()),
]
