from django.contrib import admin
from .models import Port, PortCongestion

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'latitude', 'longitude')
    list_filter = ('country',)
    search_fields = ('name', 'code', 'country')
    readonly_fields = ('created_at',)

@admin.register(PortCongestion)
class PortCongestionAdmin(admin.ModelAdmin):
    list_display = ('port', 'congestion_level', 'vessels_waiting', 'average_wait_time', 'timestamp')
    list_filter = ('congestion_level', 'timestamp', 'port__country')
    search_fields = ('port__name', 'port__code')
    readonly_fields = ('created_at',)