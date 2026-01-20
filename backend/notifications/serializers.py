from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    vessel_info = serializers.SerializerMethodField()
    port_info = serializers.SerializerMethodField()
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display', 'severity', 'severity_display',
            'title', 'message', 'vessel_info', 'port_info', 'data', 'is_read',
            'created_at', 'read_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_vessel_info(self, obj):
        if obj.vessel:
            return {
                'mmsi': obj.vessel.mmsi,
                'vessel_name': obj.vessel.vessel_name,
                'vessel_type_text': obj.vessel.vessel_type_text
            }
        return None
    
    def get_port_info(self, obj):
        if obj.port:
            return {
                'code': obj.port.code,
                'name': obj.port.name,
                'country': obj.port.country
            }
        return None
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            return f"{diff.seconds // 60}m ago"
        elif diff < timedelta(days=1):
            return f"{diff.seconds // 3600}h ago"
        else:
            return f"{diff.days}d ago"