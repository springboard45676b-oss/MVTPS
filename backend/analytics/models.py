from django.db import models
from vessels.models import Vessel
from ports.models import Port

class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    origin_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='departures', null=True, blank=True)
    destination_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='arrivals', null=True, blank=True)
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='planned')
    distance = models.FloatField(null=True, blank=True)  # in nautical miles
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.vessel.name} - {self.status}"

class VoyageEvent(models.Model):
    EVENT_TYPES = [
        ('departure', 'Departure'),
        ('arrival', 'Arrival'),
        ('port_call', 'Port Call'),
        ('anchor', 'Anchoring'),
        ('emergency', 'Emergency'),
        ('maintenance', 'Maintenance'),
    ]
    
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.voyage.vessel.name} - {self.event_type} ({self.timestamp})"