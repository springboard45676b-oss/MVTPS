"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponse
from pathlib import Path


def index_not_built(request):
    return HttpResponse(
        "React build not found. In development run the React dev server (port 3000) or build the frontend and place the output in `frontend/build`.",
        content_type="text/plain",
    )


urlpatterns = [
    path('admin/', admin.site.urls),
    # path('accounts/', include('accounts.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('api.urls')),
    path('api/ports/', include('ports.urls')),
]

# Serve React's index.html for the root URL only if the build exists
build_index = Path(settings.BASE_DIR) / 'frontend' / 'build' / 'index.html'
if build_index.exists():
    urlpatterns.append(path('', TemplateView.as_view(template_name='index.html')))
else:
    urlpatterns.append(path('', index_not_built))
