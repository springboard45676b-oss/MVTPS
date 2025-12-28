from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Voyage
from .serializers import VoyageSerializer


class VoyageListView(generics.ListAPIView):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [IsAuthenticated]











