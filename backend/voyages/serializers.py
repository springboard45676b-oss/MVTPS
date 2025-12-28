from rest_framework import serializers
from .models import Voyage


class VoyageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voyage
        fields = ("id", "name")











