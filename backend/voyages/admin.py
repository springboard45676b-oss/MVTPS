from django.contrib import admin
from .models import Voyage, VoyageEvent

@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'origin_port', 'destination_port', 'status', 'departure_time', 'estimated_arrival')
    list_filter = ('status', 'departure_time', 'created_at')
    search_fields = ('vessel__name', 'origin_port__name', 'destination_port__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VoyageEvent)
class VoyageEventAdmin(admin.ModelAdmin):
    list_display = ('voyage', 'event_type', 'timestamp', 'latitude', 'longitude')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('voyage__vessel__name', 'description')
    readonly_fields = ('created_at',)