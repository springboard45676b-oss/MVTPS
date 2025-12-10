from django.db import models
from vessels.models import Vessel
from ports.models import Port

class Voyage(models.Model):
    STATUS_CHOICES = (
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    origin_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='origin_voyages')
    destination_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='destination_voyages')
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    cargo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vessel.name}: {self.origin_port.code} → {self.destination_port.code}"

class VoyageEvent(models.Model):
    EVENT_TYPES = (
        ('departure', 'Departure'),
        ('arrival', 'Arrival'),
        ('port_call', 'Port Call'),
        ('delay', 'Delay'),
        ('weather', 'Weather Event'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    )
    
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.voyage.vessel.name} - {self.event_type} - {self.timestamp}"