from django.contrib import admin
from .models import Port

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'latitude', 'longitude', 'created_at')
    list_filter = ('country', 'created_at')
    search_fields = ('name', 'code', 'country')
    readonly_fields = ('created_at', 'updated_at')