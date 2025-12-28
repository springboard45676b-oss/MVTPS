from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.utils import timezone
from django.db.models import Prefetch

from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert


SPEED_MOVING_THRESHOLD = 0.5  # knots


@dataclass
class VesselState:
    """Derived state for a vessel at a given position."""

    speed: Optional[float]
    status: str  # "moving" or "stopped"
    in_port: bool


def _derive_state(position: VesselPosition) -> VesselState:
    speed = position.speed if position.speed is not None else 0.0
    moving = speed > SPEED_MOVING_THRESHOLD
    status = "moving" if moving else "stopped"

    # Placeholder heuristic: treat very low-speed as being "in port".
    # This can later be replaced with real port-geometry logic.
    in_port = not moving

    return VesselState(speed=position.speed, status=status, in_port=in_port)


def _create_alert_if_not_exists(
    *,
    user,
    vessel,
    alert_type: str,
    message: str,
    event_time,
) -> int:
    """Create a VesselAlert if a similar alert does not already exist.

    We de-duplicate by user+vessel+alert_type and created_at >= event_time,
    so the same event (for a given latest position) only creates one alert
    even if the evaluator runs multiple times.
    """

    exists = VesselAlert.objects.filter(
        user=user,
        vessel=vessel,
        alert_type=alert_type,
        created_at__gte=event_time,
    ).exists()

    if exists:
        return 0

    VesselAlert.objects.create(
        user=user,
        vessel=vessel,
        alert_type=alert_type,
        message=message,
    )
    return 1


def _evaluate_speed_threshold(
    *,
    subscription: VesselSubscription,
    latest: VesselPosition,
    previous: Optional[VesselPosition],
    now,
) -> int:
    if "speed" not in subscription.alert_types:
        return 0

    if subscription.speed_threshold is None:
        # Threshold not configured; nothing to do.
        return 0

    if latest.speed is None:
        return 0

    # Fire only when we cross from below/at threshold to above threshold.
    crossed_up = latest.speed > subscription.speed_threshold and (
        previous is None
        or previous.speed is None
        or previous.speed <= subscription.speed_threshold
    )

    if not crossed_up:
        return 0

    message = (
        f"Speed {latest.speed:.1f} kn exceeded threshold "
        f"{subscription.speed_threshold:.1f} kn at {latest.timestamp}."
    )

    return _create_alert_if_not_exists(
        user=subscription.user,
        vessel=subscription.vessel,
        alert_type=VesselAlert.AlertType.SPEED,
        message=message,
        event_time=latest.timestamp,
    )


def _evaluate_status_change(
    *,
    subscription: VesselSubscription,
    latest: VesselPosition,
    previous: Optional[VesselPosition],
    now,
) -> int:
    if "status" not in subscription.alert_types or previous is None:
        return 0

    latest_state = _derive_state(latest)
    previous_state = _derive_state(previous)

    if latest_state.status == previous_state.status:
        return 0

    message = (
        f"Status changed from {previous_state.status} to {latest_state.status} "
        f"at {latest.timestamp}."
    )

    return _create_alert_if_not_exists(
        user=subscription.user,
        vessel=subscription.vessel,
        alert_type=VesselAlert.AlertType.STATUS,
        message=message,
        event_time=latest.timestamp,
    )


def _evaluate_port_events(
    *,
    subscription: VesselSubscription,
    latest: VesselPosition,
    previous: Optional[VesselPosition],
    now,
) -> int:
    if "port" not in subscription.alert_types or previous is None:
        return 0

    latest_state = _derive_state(latest)
    previous_state = _derive_state(previous)

    created = 0

    # Enter port: moving -> in_port
    if not previous_state.in_port and latest_state.in_port:
        message = f"Vessel appears to have entered port around {latest.timestamp}."
        created += _create_alert_if_not_exists(
            user=subscription.user,
            vessel=subscription.vessel,
            alert_type=VesselAlert.AlertType.PORT,
            message=message,
            event_time=latest.timestamp,
        )

    # Exit port: in_port -> moving
    if previous_state.in_port and not latest_state.in_port:
        message = f"Vessel appears to have left port around {latest.timestamp}."
        created += _create_alert_if_not_exists(
            user=subscription.user,
            vessel=subscription.vessel,
            alert_type=VesselAlert.AlertType.PORT,
            message=message,
            event_time=latest.timestamp,
        )

    return created


def evaluate_vessel_alerts(now=None) -> int:
    """Evaluate all active vessel subscriptions and create alerts.

    This function is side-effectful (writes VesselAlert entries) but has no
    external dependencies, so it can be called from a management command,
    Celery task, or cron job.
    """

    if now is None:
        now = timezone.now()

    subscriptions = (
        VesselSubscription.objects.filter(is_active=True)
        .select_related("user", "vessel")
        .prefetch_related(
            Prefetch(
                "vessel__positions",
                queryset=VesselPosition.objects.only(
                    "id",
                    "vessel_id",
                    "timestamp",
                    "latitude",
                    "longitude",
                    "speed",
                    "course",
                    "heading",
                ).order_by("-timestamp"),
            )
        )
    )

    total_created = 0

    for sub in subscriptions:
        vessel: Vessel = sub.vessel
        positions = list(vessel.positions.all()[:2])
        if not positions:
            continue

        latest = positions[0]
        previous = positions[1] if len(positions) > 1 else None

        total_created += _evaluate_speed_threshold(
            subscription=sub,
            latest=latest,
            previous=previous,
            now=now,
        )
        total_created += _evaluate_status_change(
            subscription=sub,
            latest=latest,
            previous=previous,
            now=now,
        )
        total_created += _evaluate_port_events(
            subscription=sub,
            latest=latest,
            previous=previous,
            now=now,
        )

    return total_created
