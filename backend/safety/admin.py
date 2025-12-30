from django.contrib import admin
from .models import SafetyZone, WeatherData

@admin.register(SafetyZone)
class SafetyZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone_type', 'risk_level', 'active', 'created_at', 'expires_at')
    list_filter = ('zone_type', 'risk_level', 'active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ('latitude', 'longitude', 'wind_speed', 'wind_direction', 'wave_height', 'timestamp')
    list_filter = ('timestamp',)
    readonly_fields = ('created_at',)