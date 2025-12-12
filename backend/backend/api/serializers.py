from .models import Vessel # Ensure User is also imported

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'vessel_type', 'flag', 'latitude', 'longitude', 'status']