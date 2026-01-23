from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Vessel
from .serializers import VesselSerializer

class VesselListView(APIView):
    def get(self, request):
        vessels = Vessel.objects.all()
        serializer = VesselSerializer(vessels, many=True)
        return Response(serializer.data)
