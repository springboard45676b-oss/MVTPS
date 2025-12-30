from django.urls import path
from . import views

urlpatterns = [
    path('zones/', views.SafetyZoneListView.as_view(), name='safety-zones'),
    path('weather/', views.WeatherDataListView.as_view(), name='weather-data'),
]