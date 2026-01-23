from django.contrib import admin
from .models import Vessel, Port, AlertEvent, VoyageHistory

@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    # Ensure these names match the fields in your Vessel model exactly
    list_display = ('name', 'type', 'flag', 'last_position_lat', 'last_position_lon')

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    # Changed 'location' to 'country' based on your schema [cite: 116]
    list_display = ('name', 'country', 'congestion_score')

admin.site.register(VoyageHistory)
admin.site.register(AlertEvent)