# tracking/urls.py
from django.urls import path
from .views import LiveVesselView, AdminVesselControl

urlpatterns = [
    path("vessels/", LiveVesselView.as_view(), name="live-vessels"),
    path("admin/ais-control/", AdminVesselControl.as_view(), name="admin-ais"),
]
