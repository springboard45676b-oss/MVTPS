from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VoyageReplayViewSet

router = DefaultRouter()
router.register(r'voyage-replay', VoyageReplayViewSet, basename='voyage-replay')

urlpatterns = [
    path('', include(router.urls)),
]