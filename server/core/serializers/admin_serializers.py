"""
Admin Serializers
Handles user action logging and admin analytics
"""

from rest_framework import serializers
from ..models import UserAction


class UserActionSerializer(serializers.ModelSerializer):
    """User action logging serializer with display fields"""
    
    username = serializers.CharField(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    status_display = serializers.CharField(source='get_status_code_display', read_only=True)
    is_successful = serializers.BooleanField(read_only=True)
    is_error = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserAction
        fields = [
            'id',
            'username',
            'action',
            'action_display',
            'status_code',
            'status_display',
            'endpoint',
            'method',
            'ip_address',
            'related_object_type',
            'related_object_id',
            'timestamp',
            'duration_ms',
            'is_successful',
            'is_error',
            'error_message'
        ]