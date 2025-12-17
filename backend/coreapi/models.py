from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100, blank=True)
    port_type = models.CharField(max_length=100, blank=True)
    berths = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.country})"
