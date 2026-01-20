from rest_framework import generics
from .models import Vessel
from rest_framework import serializers

# This converts ship data into a format the Map can read
class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'imo_number', 'type', 'flag', 'last_position_lat', 'last_position_lon']

class VesselListView(generics.ListAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    
class VoyageHistoryView(generics.ListAPIView):
    serializer_class = VesselSerializer # You can reuse or make a simple one
    def get_queryset(self):
        vessel_id = self.kwargs['vessel_id']
        return VoyageHistory.objects.filter(vessel_id=vessel_id).order_by('timestamp')