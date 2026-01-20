from django.contrib import admin
from .models import VoyageReplay, VoyagePosition, ComplianceViolation

@admin.register(VoyageReplay)
class VoyageReplayAdmin(admin.ModelAdmin):
    list_display = ['voyage_id', 'vessel', 'start_time', 'end_time', 'status']
    list_filter = ['status', 'start_time']
    search_fields = ['voyage_id', 'vessel__vessel_name', 'vessel__mmsi']
    readonly_fields = ['voyage_id']

@admin.register(VoyagePosition)
class VoyagePositionAdmin(admin.ModelAdmin):
    list_display = ['voyage', 'latitude', 'longitude', 'speed', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['voyage__voyage_id']

@admin.register(ComplianceViolation)
class ComplianceViolationAdmin(admin.ModelAdmin):
    list_display = ['voyage', 'violation_type', 'severity', 'timestamp']
    list_filter = ['violation_type', 'severity', 'timestamp']
    search_fields = ['voyage__voyage_id', 'description']