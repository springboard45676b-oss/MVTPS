from django.urls import path
from .views import VoyageListView

urlpatterns = [
    path("voyages/", VoyageListView.as_view(), name="voyage-list"),
]











