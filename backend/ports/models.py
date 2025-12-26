from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta

class Port(models.Model):
    """
    Port information with location and operational data
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)  # UNLOCODE
    country = models.CharField(max_length=100)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    berths = models.PositiveIntegerField(default=10, help_text="Number of berths")
    annual_throughput = models.PositiveIntegerField(default=0, help_text="TEU per year")
    port_efficiency_index = models.FloatField(default=1.0, help_text="UNCTAD efficiency index")
    capacity = models.PositiveIntegerField(help_text="Maximum vessel capacity")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def current_congestion_level(self):
        """Calculate current congestion based on vessels in port"""
        latest_congestion = self.congestion_data.first()
        if latest_congestion:
            return latest_congestion.congestion_level
        return 'low'
    
    @property
    def congestion_percentage(self):
        """Calculate congestion as percentage of capacity"""
        latest_congestion = self.congestion_data.first()
        if latest_congestion and self.berths > 0:
            return min(100, (latest_congestion.current_vessels / self.berths) * 100)
        return 0

class PortCongestion(models.Model):
    """
    Real-time port congestion data and analytics
    """
    CONGESTION_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='congestion_data')
    current_vessels = models.PositiveIntegerField(default=0)
    waiting_vessels = models.PositiveIntegerField(default=0)
    average_wait_time = models.FloatField(help_text="Average wait time in hours")
    arrivals_24h = models.PositiveIntegerField(default=0, help_text="Arrivals in last 24h")
    departures_24h = models.PositiveIntegerField(default=0, help_text="Departures in last 24h")
    throughput_efficiency = models.FloatField(default=1.0, help_text="Current vs expected throughput")
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        get_latest_by = 'timestamp'
    
    def __str__(self):
        return f"{self.port.name} - {self.congestion_level} ({self.timestamp})"

class VesselMovement(models.Model):
    """
    Vessel arrivals and departures for congestion analysis
    """
    MOVEMENT_TYPES = [
        ('arrival', 'Arrival'),
        ('departure', 'Departure'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('arrived', 'Arrived'),
        ('berthed', 'Berthed'),
        ('departed', 'Departed'),
        ('delayed', 'Delayed')
    ]
    
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='vessel_movements')
    vessel_name = models.CharField(max_length=200)
    vessel_imo = models.CharField(max_length=20, blank=True)
    vessel_mmsi = models.CharField(max_length=20, blank=True)
    vessel_type = models.CharField(max_length=50, default='cargo')
    
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    scheduled_time = models.DateTimeField()
    actual_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    wait_time_hours = models.FloatField(default=0)
    cargo_volume = models.FloatField(default=0, help_text="TEU or tons")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_time']
    
    def __str__(self):
        return f"{self.vessel_name} - {self.movement_type} at {self.port.name}"