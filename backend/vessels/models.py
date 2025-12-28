from django.db import models


class Vessel(models.Model):
    mmsi = models.CharField(max_length=20, unique=True)
    imo = models.CharField(max_length=20, null=True, blank=True)
    name = models.CharField(max_length=255)
    flag = models.CharField(max_length=64, null=True, blank=True)
    vessel_type = models.CharField(max_length=64, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=("mmsi",)),
            models.Index(fields=("imo",)),
        ]

    def __str__(self) -> str:
        return self.name


class VesselPosition(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="positions")
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    heading = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ("-timestamp",)
        indexes = [
            models.Index(fields=("vessel", "timestamp")),
            models.Index(fields=("timestamp",)),
        ]
        unique_together = [("vessel", "timestamp")]

    def __str__(self) -> str:
        return f"{self.vessel.name} @ {self.timestamp}"


class VesselAlertSubscription(models.Model):
    class AlertTypes(models.TextChoices):
        ENTER_EXIT_PORT = "enter_exit_port", "Enter / Exit Port"
        SPEED_THRESHOLD = "speed_threshold", "Speed Threshold Exceeded"
        STATUS_CHANGE = "status_change", "Status Change"

    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="vessel_subscriptions")
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="alert_subscriptions")
    alert_enter_exit_port = models.BooleanField(default=False)
    alert_speed_threshold = models.BooleanField(default=False)
    alert_status_change = models.BooleanField(default=False)
    speed_threshold = models.FloatField(null=True, blank=True, help_text="Knots for speed alerts")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "vessel")

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.vessel.name}"


class VesselAlertTrigger(models.Model):
    class AlertType(models.TextChoices):
        ENTER_PORT = "enter_port", "Enter Port"
        EXIT_PORT = "exit_port", "Exit Port"
        SPEED_THRESHOLD = "speed_threshold", "Speed Threshold Exceeded"
        STATUS_CHANGE = "status_change", "Status Change"

    subscription = models.ForeignKey(
        VesselAlertSubscription, on_delete=models.CASCADE, related_name="triggers"
    )
    alert_type = models.CharField(max_length=32, choices=AlertType.choices)
    triggered_at = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    class Meta:
        ordering = ("-triggered_at",)

    def __str__(self) -> str:
        return f"{self.subscription} [{self.alert_type}]"


class VesselSubscription(models.Model):
    """
    Subscription for vessel alerts.

    `alert_types` is a list of alert categories (e.g. ["speed", "port"]).
    Actual alert logic is implemented elsewhere.
    """

    class AlertType(models.TextChoices):
        SPEED = "speed", "Speed"
        PORT = "port", "Port"
        STATUS = "status", "Status"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="vessel_alert_subscriptions",
    )
    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    # Store selected alert types as a JSON array of strings
    alert_types = models.JSONField(
        default=list,
        help_text="List of alert types: speed, port, status",
    )
    speed_threshold = models.FloatField(
        null=True,
        blank=True,
        help_text="Speed threshold in knots for 'speed' alerts.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "vessel")
        indexes = [
            models.Index(fields=("user", "vessel")),
            models.Index(fields=("vessel", "is_active")),
        ]

    def __str__(self) -> str:
        return f"{self.user} -> {self.vessel} ({', '.join(self.alert_types)})"


class VesselAlert(models.Model):
    """
    Concrete alert instances generated for a vessel.

    Creation is handled by alert logic outside of this model.
    """

    class AlertType(models.TextChoices):
        SPEED = "speed", "Speed"
        PORT = "port", "Port"
        STATUS = "status", "Status"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="vessel_alerts",
    )
    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="alerts",
    )
    alert_type = models.CharField(max_length=16, choices=AlertType.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("user", "created_at")),
            models.Index(fields=("vessel", "created_at")),
            models.Index(fields=("alert_type", "created_at")),
        ]

    def __str__(self) -> str:
        return f"[{self.created_at}] {self.vessel} - {self.alert_type}"
