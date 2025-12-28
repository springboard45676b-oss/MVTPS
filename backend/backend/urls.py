from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("vessels.urls")),
    path("api/", include("ports.urls")),
    path("api/", include("voyages.urls")),
    path("api/", include("events.urls")),
    path("api/", include("notifications.urls")),
]






urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("vessels.urls")),
    path("api/", include("ports.urls")),
    path("api/", include("voyages.urls")),
    path("api/", include("events.urls")),
    path("api/", include("notifications.urls")),
]




