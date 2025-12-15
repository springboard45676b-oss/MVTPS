from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name


class Vessel(models.Model):
    name = models.CharField(max_length=200)
    mmsi = models.CharField(max_length=50, blank=True, null=True)
    imo = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name


class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    origin = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name="departures")
    destination = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name="arrivals")
    departure = models.DateTimeField()
    arrival = models.DateTimeField()


class Event(models.Model):
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField()


class Notification(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
