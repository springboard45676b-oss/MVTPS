from django.contrib import admin
from .models import Port

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country', 'port_type', 'berths')
    search_fields = ('name', 'country', 'port_type')
