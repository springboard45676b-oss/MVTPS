from django.contrib import admin
from .models import Vessel, VesselPosition


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'imo_number',
        'type',
        'flag',
        'cargo_type',
        'operator',
        'last_update',
    )
    list_filter = ('type', 'flag')
    search_fields = ('name', 'imo_number', 'operator')
    readonly_fields = ('last_update',)


@admin.register(VesselPosition)
class VesselPositionAdmin(admin.ModelAdmin):
    list_display = (
        'vessel',
        'latitude',
        'longitude',
        'speed',
        'course',
        'timestamp',
    )
    list_filter = ('timestamp',)
    search_fields = ('vessel__name', 'vessel__imo_number')
