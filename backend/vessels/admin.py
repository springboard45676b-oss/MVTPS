from django.contrib import admin

from .models import VesselSubscription, VesselAlert


@admin.register(VesselSubscription)
class VesselSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "vessel", "is_active")
    list_filter = ("is_active",)
    search_fields = ("user__username", "vessel__name", "vessel__mmsi")


@admin.register(VesselAlert)
class VesselAlertAdmin(admin.ModelAdmin):
    list_display = ("user", "vessel", "alert_type", "created_at")
    list_filter = ("alert_type", "created_at")
    search_fields = ("user__username", "vessel__name", "vessel__mmsi", "message")

