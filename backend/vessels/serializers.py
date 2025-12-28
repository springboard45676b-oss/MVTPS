from rest_framework import serializers
from .models import (
    Vessel,
    VesselPosition,
    VesselAlertSubscription,
    VesselAlertTrigger,
    VesselSubscription,
    VesselAlert,
)


class VesselPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselPosition
        fields = ("timestamp", "latitude", "longitude", "speed", "course", "heading")


class VesselSerializer(serializers.ModelSerializer):
    latest_position = serializers.SerializerMethodField()

    class Meta:
        model = Vessel
        fields = (
            "id",
            "mmsi",
            "imo",
            "name",
            "flag",
            "vessel_type",
            "latest_position",
        )

    def get_latest_position(self, obj):
        # Get from prefetched positions (ordered by -timestamp, so first is latest)
        prefetched = getattr(obj, "_prefetched_positions", None)
        if prefetched and len(prefetched) > 0:
            return VesselPositionSerializer(prefetched[0]).data
        
        # Fallback to querying the database
        latest = obj.positions.first()
        if not latest:
            return None
        return VesselPositionSerializer(latest).data


class VesselDetailSerializer(serializers.ModelSerializer):
    """
    Vessel detail for the MMSI-based endpoint.

    Returns static vessel info plus the latest known position only
    (history is provided by the dedicated route endpoint).
    """

    latest_position = serializers.SerializerMethodField()

    class Meta:
        model = Vessel
        fields = (
            "id",
            "mmsi",
            "imo",
            "name",
            "vessel_type",
            "flag",
            "latest_position",
        )

    def get_latest_position(self, obj):
        """
        Get the latest position for this vessel.

        We rely on the related manager ordering (Meta.ordering = "-timestamp"),
        so `.first()` is efficient and uses the `(vessel, timestamp)` index.
        """
        latest = getattr(obj, "_latest_position", None)
        if latest is None:
            latest = obj.positions.first()
        if not latest:
            return None
        return VesselPositionSerializer(latest).data


class VesselAlertSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselAlertSubscription
        fields = (
            "id",
            "vessel",
            "alert_enter_exit_port",
            "alert_speed_threshold",
            "alert_status_change",
            "speed_threshold",
            "is_active",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        if not (
            attrs.get("alert_enter_exit_port")
            or attrs.get("alert_speed_threshold")
            or attrs.get("alert_status_change")
        ):
            raise serializers.ValidationError("At least one alert type must be selected.")
        if attrs.get("alert_speed_threshold") and attrs.get("speed_threshold") is None:
            raise serializers.ValidationError("speed_threshold is required when speed alert is enabled.")
        return attrs


class VesselAlertTriggerSerializer(serializers.ModelSerializer):
    vessel = serializers.CharField(source="subscription.vessel.name", read_only=True)

    class Meta:
        model = VesselAlertTrigger
        fields = ("id", "vessel", "alert_type", "triggered_at", "details")


class VesselSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselSubscription
        fields = (
            "id",
            "vessel",
            "alert_types",
            "speed_threshold",
            "is_active",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        alert_types = attrs.get("alert_types") or []
        if not alert_types:
            # Allow explicit unsubscribe by setting is_active=False with no alert types.
            if attrs.get("is_active", True):
                raise serializers.ValidationError("At least one alert type must be selected.")
        if "speed" in alert_types and attrs.get("speed_threshold") is None:
            raise serializers.ValidationError("speed_threshold is required when speed alert is enabled.")
        return attrs


class VesselAlertSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source="vessel.name", read_only=True)
    vessel_mmsi = serializers.CharField(source="vessel.mmsi", read_only=True)

    class Meta:
        model = VesselAlert
        fields = (
            "id",
            "vessel_name",
            "vessel_mmsi",
            "alert_type",
            "message",
            "created_at",
        )
