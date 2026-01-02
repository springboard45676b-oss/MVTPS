from django.contrib import admin
from .models import Port

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'country',
        'arrivals',
        'departures',
        'avg_wait_time',
        'congestion_score',
        'last_update',
    )
