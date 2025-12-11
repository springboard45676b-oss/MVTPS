from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to Vessel Management Backend!")

urlpatterns = [
    # Home page
    path("", home),

    # Admin panel
    path("admin/", admin.site.urls),

    # App-level API endpoints (viewsets, registration, current user)
    path("api/", include("api.urls")),

    # JWT authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
