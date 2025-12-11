from django.urls import path, include
from rest_framework import routers
from .views import PortViewSet, VesselViewSet, VoyageViewSet, CurrentUserView, UserRegistrationView

# -------------------------
# DRF Router for viewsets
# -------------------------
router = routers.DefaultRouter()
router.register(r"ports", PortViewSet, basename="port")
router.register(r"vessels", VesselViewSet, basename="vessel")
router.register(r"voyages", VoyageViewSet, basename="voyage")

# -------------------------
# URL Patterns
# -------------------------
urlpatterns = [
    # DRF viewsets: list, retrieve, create, update, delete
    path("", include(router.urls)),

    # Current authenticated user info: /api/me/
    path("me/", CurrentUserView.as_view(), name="current-user"),

    # User registration endpoint: /api/register/
    path("register/", UserRegistrationView.as_view(), name="register"),
]
