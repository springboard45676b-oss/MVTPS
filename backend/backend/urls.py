from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/vessels/', include('vessels.urls')),
    path('api/ports/', include('ports.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/safety/', include('safety.urls')),
    path('api/admin-tools/', include('admin_tools.urls')),
]