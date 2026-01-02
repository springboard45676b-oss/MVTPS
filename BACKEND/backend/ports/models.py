from django.db import models


class Port(models.Model):
    """
    Port model for Milestone-3
    Used for Port Analytics, Congestion Analysis & Map Visualization
    """

    name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)

    # Geo-coordinates (for map rendering)
    location_lat = models.FloatField()
    location_lon = models.FloatField()

    # Traffic metrics
    arrivals = models.PositiveIntegerField(default=0)
    departures = models.PositiveIntegerField(default=0)

    # Average waiting time in hours
    avg_wait_time = models.FloatField(default=0.0)

    # Computed congestion score (auto-calculated)
    congestion_score = models.FloatField(default=0.0)

    # Last updated timestamp
    last_update = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """
        Auto-calculate congestion score:
        Higher arrivals + higher wait time = more congestion
        Division by zero protected
        """
        self.congestion_score = round(
            (self.avg_wait_time * self.arrivals) / (self.departures + 1),
            2
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.country}"
