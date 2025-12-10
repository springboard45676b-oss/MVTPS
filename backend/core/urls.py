from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'ports', PortViewSet)
router.register(r'vessels', VesselViewSet)
router.register(r'voyages', VoyageViewSet)
router.register(r'events', EventViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/token/', MyTokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/profile/', ProfileView.as_view()),
    path('api/', include(router.urls)),
]
