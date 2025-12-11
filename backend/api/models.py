from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# -------------------------
# USER MODEL
# -------------------------
class User(AbstractUser):
    ROLE_CHOICES = [
        ('operator', 'Operator'),
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

# -------------------------
# PORT MODEL
# -------------------------
class Port(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.name} - {self.location}"

# -------------------------
# VESSEL MODEL
# -------------------------
class Vessel(models.Model):
    name = models.CharField(max_length=100)
    vessel_type = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    current_port = models.ForeignKey(
        Port, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.name

# -------------------------
# VOYAGE MODEL
# -------------------------
class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    origin = models.ForeignKey(Port, related_name="origin", on_delete=models.CASCADE)
    destination = models.ForeignKey(Port, related_name="destination", on_delete=models.CASCADE)
    departure_date = models.DateField()
    arrival_date = models.DateField()

    def clean(self):
        if self.arrival_date < self.departure_date:
            raise ValidationError("Arrival date cannot be before departure date")

    def __str__(self):
        return f"{self.vessel} {self.origin} → {self.destination}"

# -------------------------
# EVENT MODEL
# -------------------------
class Event(models.Model):
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name='events')
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M')} - {self.description[:50]}"

# -------------------------
# NOTIFICATION MODEL
# -------------------------
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}"
