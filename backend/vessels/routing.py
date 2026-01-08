from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/vessels/alerts/$', consumers.VesselAlertConsumer.as_asgi()),
    re_path(r'ws/vessels/positions/$', consumers.VesselPositionConsumer.as_asgi()),
]
