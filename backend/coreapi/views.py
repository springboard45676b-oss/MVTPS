# coreapi/views.py
from rest_framework import generics, permissions
from .models import Port
from .serializers import PortSerializer

class PortListCreateView(generics.ListCreateAPIView):
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    permission_classes = [permissions.IsAuthenticated]  # require JWT auth
