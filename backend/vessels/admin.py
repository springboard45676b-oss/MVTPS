from django.contrib import admin
from .models import Vessel, VesselPosition

@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ('name', 'imo_number', 'vessel_type', 'flag', 'gross_tonnage', 'created_at')
    list_filter = ('vessel_type', 'flag', 'created_at')
    search_fields = ('name', 'imo_number', 'owner', 'operator')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VesselPosition)
class VesselPositionAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'latitude', 'longitude', 'speed', 'timestamp')
    list_filter = ('timestamp', 'vessel__vessel_type')
    search_fields = ('vessel__name', 'vessel__imo_number')
    readonly_fields = ('created_at',)