"""
Django Admin Configuration for Maritime Vessel Tracking Platform.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Vessel, Port, Voyage, VoyageWaypoint,
    SafetyZone, Event, Notification, APISource, SystemLog
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'company', 'is_active', 'last_login']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'company']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'company', 'phone', 'avatar', 'last_activity')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'company', 'phone')}),
    )


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ['name', 'imo_number', 'vessel_type', 'flag', 'status', 'speed', 'last_update']
    list_filter = ['vessel_type', 'status', 'flag']
    search_fields = ['name', 'imo_number', 'mmsi']
    readonly_fields = ['last_update', 'created_at']


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'country', 'congestion_score', 'avg_wait_time', 'vessels_in_port']
    list_filter = ['country']
    search_fields = ['name', 'code', 'country']
    readonly_fields = ['last_update', 'created_at']


@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ['voyage_id', 'vessel', 'port_from', 'port_to', 'departure_time', 'status']
    list_filter = ['status']
    search_fields = ['voyage_id', 'vessel__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VoyageWaypoint)
class VoyageWaypointAdmin(admin.ModelAdmin):
    list_display = ['voyage', 'latitude', 'longitude', 'speed', 'timestamp']
    list_filter = ['voyage']


@admin.register(SafetyZone)
class SafetyZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'zone_type', 'severity', 'is_active', 'valid_from', 'valid_until']
    list_filter = ['zone_type', 'severity', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'vessel', 'port', 'is_critical', 'timestamp']
    list_filter = ['event_type', 'is_critical']
    search_fields = ['title', 'description']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['title', 'message']


@admin.register(APISource)
class APISourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_url', 'is_active', 'status', 'last_sync']
    list_filter = ['is_active', 'status']


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['level', 'module', 'message', 'user', 'timestamp']
    list_filter = ['level', 'module']
    search_fields = ['message']
    readonly_fields = ['timestamp']