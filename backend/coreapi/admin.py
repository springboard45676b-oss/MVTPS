from django.contrib import admin
from .models import Vessel, Port, VoyageHistory #

@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ('name', 'imo_number', 'type', 'flag', 'last_position_lat', 'last_position_lon') #

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'country', 'congestion_score') #

@admin.register(VoyageHistory)
class VoyageHistoryAdmin(admin.ModelAdmin):
    # list_display tells Django which columns to show in the table
    list_display = ('vessel', 'latitude', 'longitude', 'timestamp')
    # list_filter adds the sidebar filter you see in your screenshots
    list_filter = ('vessel',)