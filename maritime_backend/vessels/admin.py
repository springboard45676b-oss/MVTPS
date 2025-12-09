from django.contrib import admin
from .models import Vessel, Port, Voyage, Event, Notification, Congestion, ArrivalDeparture


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ('name', 'flag', 'type', 'last_update')
    list_filter = ('type', 'flag')
    search_fields = ('name',)


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'last_update')
    list_filter = ('country',)
    search_fields = ('name', 'country')


@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'port_from', 'port_to', 'status', 'departure_time', 'arrival_time')
    list_filter = ('status', 'cargo_type')
    search_fields = ('vessel__name', 'imo_number')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'event_type', 'location', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('vessel__name', 'location')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('user__username', 'message')


@admin.register(Congestion)
class CongestionAdmin(admin.ModelAdmin):
    list_display = ('port', 'congestion_score', 'avg_wait_time', 'last_update')
    list_filter = ('last_update',)
    search_fields = ('port__name',)


@admin.register(ArrivalDeparture)
class ArrivalDepartureAdmin(admin.ModelAdmin):
    list_display = ('port', 'arrivals', 'departures', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('port__name',)
