from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Port
from .serializers import PortSerializer


class PortListView(generics.ListAPIView):
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    permission_classes = [IsAuthenticated]











