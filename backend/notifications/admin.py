from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'severity', 'user', 'vessel', 'port', 'is_read', 'created_at']
    list_filter = ['notification_type', 'severity', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username', 'vessel__vessel_name', 'port__name']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('notification_type', 'severity', 'title', 'message')
        }),
        ('Relationships', {
            'fields': ('user', 'vessel', 'port')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('data', 'created_at'),
            'classes': ('collapse',)
        })
    )
