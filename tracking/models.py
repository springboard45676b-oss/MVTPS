# tracking/models.py
from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True, null=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class Vessel(models.Model):
    name = models.CharField(max_length=200)
    mmsi = models.CharField(max_length=50, blank=True, null=True)
    imo = models.CharField(max_length=50, blank=True, null=True)
    callsign = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    origin = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='voyages_from')
    destination = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='voyages_to')
    departure = models.DateTimeField(null=True, blank=True)
    arrival = models.DateTimeField(null=True, blank=True)

class Event(models.Model):
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, null=True, blank=True)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)

class Notification(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
