from django.contrib import admin
from .models import Vessel, Position


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = (
        'mmsi',
        'name',
        'vessel_type',
        'flag',
        'cargo',
        'destination',
    )
    search_fields = ('mmsi', 'name', 'destination')
    list_filter = ('vessel_type', 'flag', 'cargo')


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = (
        'vessel',
        'latitude',
        'longitude',
        'speed',
        'course',
        'timestamp',
    )
    list_filter = ('timestamp',)
