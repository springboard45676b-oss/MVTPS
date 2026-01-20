from django.db import models

class Vessel(models.Model):
    mmsi = models.CharField(max_length=9, unique=True)
    name = models.CharField(max_length=255)
    vessel_type = models.CharField(max_length=100)
    flag = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=255, blank=True, null=True)
    eta = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.mmsi})"


class Position(models.Model):
    vessel = models.ForeignKey(
        Vessel,
        related_name="positions",
        on_delete=models.CASCADE
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField()
    course = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vessel.name} @ {self.timestamp}"
