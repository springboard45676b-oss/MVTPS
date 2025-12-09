from django.db import models
from django.conf import settings


class Vessel(models.Model):
    """
    Vessel model - stores ship information
    """
    name = models.CharField(max_length=255)
    flag = models.CharField(max_length=100)
    last_position_lat = models.FloatField(null=True, blank=True)
    last_position_lon = models.FloatField(null=True, blank=True)
    last_update = models.DateTimeField(null=True, blank=True)
    type = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.name} ({self.flag})"
    
    class Meta:
        db_table = 'vessels'


class Port(models.Model):
    """
    Port model - stores port information
    """
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    last_update = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name}, {self.country}"
    
    class Meta:
        db_table = 'ports'


class Voyage(models.Model):
    """
    Voyage model - stores voyage information
    """
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    imo_number = models.CharField(max_length=50)
    port_from = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='departures')
    port_to = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='arrivals')
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    cargo_type = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Voyage {self.id}: {self.vessel.name} - {self.status}"
    
    class Meta:
        db_table = 'voyages'


class Event(models.Model):
    """
    Event model - stores maritime events
    """
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    details = models.TextField()
    timestamp = models.DateTimeField()
    
    def __str__(self):
        return f"{self.event_type} - {self.vessel.name} at {self.timestamp}"
    
    class Meta:
        db_table = 'events'
        ordering = ['-timestamp']


class Notification(models.Model):
    """
    Notification model - stores user notifications
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username} at {self.timestamp}"
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-timestamp']


class Congestion(models.Model):
    """
    Congestion model - stores port congestion data
    """
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='congestions')
    congestion_score = models.FloatField()
    avg_wait_time = models.FloatField()
    last_update = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.port.name} - Score: {self.congestion_score}"
    
    class Meta:
        db_table = 'congestions'


class ArrivalDeparture(models.Model):
    """
    ArrivalDeparture model - stores port traffic statistics
    """
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='traffic_stats')
    arrivals = models.IntegerField(default=0)
    departures = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.port.name} - A:{self.arrivals} D:{self.departures}"
    
    class Meta:
        db_table = 'arrivals_departures'
        ordering = ['-timestamp']
