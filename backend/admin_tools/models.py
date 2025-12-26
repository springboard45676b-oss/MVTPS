from django.db import models
from users.models import User

class APISource(models.Model):
    """
    External API sources configuration and health monitoring
    """
    SOURCE_TYPES = [
        ('ais', 'AIS Data Provider'),
        ('weather', 'Weather Service'),
        ('port', 'Port Authority'),
        ('traffic', 'Marine Traffic'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
        ('maintenance', 'Maintenance'),
    ]
    
    name = models.CharField(max_length=100)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    api_url = models.URLField()
    api_key = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_frequency = models.PositiveIntegerField(help_text="Sync frequency in minutes", default=15)
    error_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.source_type})"

class SystemLog(models.Model):
    """
    System logs for monitoring and debugging
    """
    LOG_LEVELS = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    level = models.CharField(max_length=20, choices=LOG_LEVELS)
    message = models.TextField()
    module = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    extra_data = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.level.upper()}: {self.message[:50]}"

class DataExport(models.Model):
    """
    Data export requests and status tracking
    """
    EXPORT_TYPES = [
        ('vessels', 'Vessels Data'),
        ('voyages', 'Voyages Data'),
        ('analytics', 'Analytics Data'),
        ('incidents', 'Incidents Data'),
        ('full', 'Full Database Export'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=500, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    date_from = models.DateTimeField(null=True, blank=True)
    date_to = models.DateTimeField(null=True, blank=True)
    filters = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.export_type} export by {self.requested_by.username}"

class SystemHealth(models.Model):
    """
    System health metrics and monitoring
    """
    cpu_usage = models.FloatField()
    memory_usage = models.FloatField()
    disk_usage = models.FloatField()
    active_connections = models.PositiveIntegerField()
    response_time = models.FloatField(help_text="Average response time in ms")
    error_rate = models.FloatField(help_text="Error rate percentage")
    uptime = models.FloatField(help_text="Uptime in hours")
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        get_latest_by = 'timestamp'
    
    def __str__(self):
        return f"System Health - {self.timestamp}"