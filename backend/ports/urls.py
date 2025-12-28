from django.urls import path
from .views import PortListView

urlpatterns = [
    path("ports/", PortListView.as_view(), name="port-list"),
]











