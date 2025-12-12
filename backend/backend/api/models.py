class Vessel(models.Model):
    name = models.CharField(max_length=100)
    vessel_type = models.CharField(max_length=50)
    flag = models.CharField(max_length=50)
    # New fields for Map
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, default="In Transit")

    def __str__(self):
        return self.name