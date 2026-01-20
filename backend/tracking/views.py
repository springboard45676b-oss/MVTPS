from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Vessel
from .services import generate_fake_ais_data
from .serializers import VesselSerializer

class LiveVesselView(APIView):
    def get(self, request):
        # Fake AIS update
        generate_fake_ais_data()

        vessels = Vessel.objects.all()
        serializer = VesselSerializer(vessels, many=True)
        return Response(serializer.data)

class AdminVesselControl(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        action = request.data.get("action")
        return Response({"message": f"Admin action executed: {action}"})
