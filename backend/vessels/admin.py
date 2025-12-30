from django.contrib import admin
from .models import Vessel, VesselPosition, VesselSubscription

@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ('name', 'mmsi', 'vessel_type', 'flag', 'length', 'gross_tonnage')
    list_filter = ('vessel_type', 'flag', 'built_year')
    search_fields = ('name', 'mmsi', 'flag')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VesselPosition)
class VesselPositionAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'latitude', 'longitude', 'speed', 'course', 'timestamp')
    list_filter = ('vessel', 'timestamp')
    search_fields = ('vessel__name', 'vessel__mmsi')
    readonly_fields = ('created_at',)

@admin.register(VesselSubscription)
class VesselSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'vessel', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'vessel__name')