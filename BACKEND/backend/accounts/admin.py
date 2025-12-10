from django.contrib import admin
from .models import UserProfile
# Register your models here.
from .models import Vessel, Port, Voyage, Event, Notification


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')



# Admin configuration for Vessel, Port, Voyage, Event, and Notification models
@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ['name', 'imo_number', 'type', 'flag', 'operator', 'last_update']
    list_filter = ['type', 'flag']
    search_fields = ['name', 'imo_number', 'operator']
    readonly_fields = ['last_update']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('imo_number', 'name', 'type', 'flag')
        }),
        ('Cargo & Operator', {
            'fields': ('cargo_type', 'operator')
        }),
        ('Position Data', {
            'fields': ('last_position_lat', 'last_position_lon', 'last_update')
        }),
    )


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'location', 'congestion_score', 'arrivals', 'departures', 'avg_wait_time']
    list_filter = ['country']
    search_fields = ['name', 'country', 'location']
    readonly_fields = ['last_update']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'location', 'country')
        }),
        ('Analytics', {
            'fields': ('congestion_score', 'avg_wait_time', 'arrivals', 'departures', 'last_update')
        }),
    )


@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ['vessel', 'port_from', 'port_to', 'status', 'departure_time', 'arrival_time']
    list_filter = ['status', 'departure_time']
    search_fields = ['vessel__name', 'port_from__name', 'port_to__name']
    date_hierarchy = 'departure_time'
    
    fieldsets = (
        ('Voyage Information', {
            'fields': ('vessel', 'status')
        }),
        ('Route', {
            'fields': ('port_from', 'port_to')
        }),
        ('Schedule', {
            'fields': ('departure_time', 'arrival_time')
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['vessel', 'event_type', 'location', 'timestamp']
    list_filter = ['event_type', 'timestamp']
    search_fields = ['vessel__name', 'location', 'details']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Event Information', {
            'fields': ('vessel', 'event_type', 'location', 'timestamp')
        }),
        ('Details', {
            'fields': ('details',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'get_short_message', 'timestamp', 'is_read']
    list_filter = ['type', 'is_read', 'timestamp']
    search_fields = ['user__username', 'message']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def get_short_message(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    get_short_message.short_description = 'Message'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'type', 'message', 'is_read')
        }),
        ('Related Objects', {
            'fields': ('vessel', 'event')
        }),
        ('Metadata', {
            'fields': ('timestamp',)
        }),
    )