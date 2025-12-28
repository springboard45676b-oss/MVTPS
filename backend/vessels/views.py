from django.db.models import Prefetch, Q, OuterRef, Subquery, Max, F
from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .serializers import VesselPositionSerializer

from .models import (
    Vessel,
    VesselPosition,
    VesselAlertSubscription,
    VesselAlertTrigger,
    VesselSubscription,
    VesselAlert,
)
from .serializers import (
    VesselSerializer,
    VesselDetailSerializer,
    VesselAlertSubscriptionSerializer,
    VesselAlertTriggerSerializer,
    VesselSubscriptionSerializer,
    VesselAlertSerializer,
)


class VesselPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class VesselListView(generics.ListAPIView):
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = VesselPagination

    def get_queryset(self):
        params = self.request.query_params

        # Build base queryset
        qs = Vessel.objects.all()

        # Search filter (name/mmsi)
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(mmsi__icontains=search)
            )

        # Vessel type filter
        vessel_type = params.get("vessel_type")
        if vessel_type:
            qs = qs.filter(vessel_type__iexact=vessel_type)

        # Flag filter
        flag = params.get("flag")
        if flag:
            qs = qs.filter(flag__iexact=flag)

        # Speed filters - need to join with latest position
        speed_min = params.get("speed_min")
        speed_max = params.get("speed_max")
        status = params.get("status")

        if speed_min is not None or speed_max is not None or status:
            # Get latest position speed for filtering
            latest_speed_subquery = VesselPosition.objects.filter(
                vessel=OuterRef('pk')
            ).order_by('-timestamp').values('speed')[:1]

            qs = qs.annotate(
                latest_speed=Subquery(latest_speed_subquery)
            )

            if speed_min is not None:
                try:
                    speed_min_float = float(speed_min)
                    qs = qs.filter(latest_speed__gte=speed_min_float)
                except (ValueError, TypeError):
                    pass

            if speed_max is not None:
                try:
                    speed_max_float = float(speed_max)
                    qs = qs.filter(latest_speed__lte=speed_max_float)
                except (ValueError, TypeError):
                    pass

            # Status filter (moving/anchored)
            if status:
                status_lower = status.lower()
                if status_lower == "moving":
                    # Moving: speed > 0.5 knots (or speed is None, treat as moving)
                    qs = qs.filter(
                        Q(latest_speed__gt=0.5) | Q(latest_speed__isnull=True)
                    )
                elif status_lower == "anchored":
                    # Anchored: speed <= 0.5 knots and not None
                    qs = qs.filter(
                        latest_speed__lte=0.5
                    ).exclude(latest_speed__isnull=True)

        # Annotate with latest position ID for serializer use
        latest_position_subquery = VesselPosition.objects.filter(
            vessel=OuterRef('pk')
        ).order_by('-timestamp').values('id')[:1]
        
        qs = qs.annotate(
            latest_position_id=Subquery(latest_position_subquery)
        )
        
        # Prefetch positions ordered by timestamp (latest first)
        # The serializer will use the first one, which is the latest
        qs = qs.prefetch_related(
            Prefetch(
                'positions',
                queryset=VesselPosition.objects.order_by('-timestamp'),
                to_attr='_prefetched_positions'
            )
        )

        return qs.order_by("id")


class VesselDetailView(generics.RetrieveAPIView):
    serializer_class = VesselDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        MMSI-based vessel detail endpoint.

        Returns static vessel data plus the latest known position.
        We avoid prefetching the full history to keep queries efficient
        even when a vessel has a large number of positions.
        """
        return Vessel.objects.only(
            "id",
            "mmsi",
            "imo",
            "name",
            "vessel_type",
            "flag",
        )

    lookup_field = "mmsi"


class VesselRouteView(generics.ListAPIView):
    """
    Returns ordered position history for a vessel, filtered by a time range.

    Endpoint: GET /api/vessels/{mmsi}/route/?range=24h|7d
    """

    serializer_class = VesselPositionSerializer
    permission_classes = [IsAuthenticated]

    def _get_time_range(self):
        range_param = self.request.query_params.get("range", "24h")
        now = timezone.now()

        if range_param == "24h":
            return now - timezone.timedelta(hours=24)
        if range_param == "7d":
            return now - timezone.timedelta(days=7)

        raise ValidationError({"range": "Invalid range. Allowed values are '24h' or '7d'."})

    def get_queryset(self):
        mmsi = self.kwargs.get("mmsi")
        since = self._get_time_range()

        # Filter directly on the positions table by vessel MMSI and time range.
        # The `(vessel, timestamp)` index plus `Meta.ordering` keeps this efficient.
        return (
            VesselPosition.objects.filter(
                vessel__mmsi=mmsi,
                timestamp__gte=since,
            )
            .only(
                "id",
                "vessel_id",
                "timestamp",
                "latitude",
                "longitude",
                "speed",
                "course",
                "heading",
            )
            .order_by("timestamp")
        )


class VesselAlertSubscriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = VesselAlertSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            VesselAlertSubscription.objects.filter(user=self.request.user)
            .select_related("vessel")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class VesselAlertSubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VesselAlertSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VesselAlertSubscription.objects.filter(user=self.request.user).select_related("vessel")


class VesselAlertTriggerListView(generics.ListAPIView):
    serializer_class = VesselAlertTriggerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = VesselPagination

    def get_queryset(self):
        return (
            VesselAlertTrigger.objects.filter(subscription__user=self.request.user)
            .select_related("subscription__vessel")
            .order_by("-triggered_at")
        )


class UserVesselSubscriptionListCreateView(generics.ListCreateAPIView):
    """
    Subscriptions based on the newer VesselSubscription model.
    """

    serializer_class = VesselSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = VesselSubscription.objects.filter(user=self.request.user).select_related("vessel")
        vessel_mmsi = self.request.query_params.get("vessel_mmsi")
        if vessel_mmsi:
            qs = qs.filter(vessel__mmsi=vessel_mmsi)
        return qs.order_by("id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserVesselSubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VesselSubscription.objects.filter(user=self.request.user).select_related("vessel")


class UserVesselAlertListView(generics.ListAPIView):
    """
    Triggered alerts for the current user based on VesselAlert.
    """

    serializer_class = VesselAlertSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = VesselPagination

    def get_queryset(self):
        qs = VesselAlert.objects.filter(user=self.request.user).select_related("vessel")

        vessel_mmsi = self.request.query_params.get("vessel_mmsi")
        if vessel_mmsi:
            qs = qs.filter(vessel__mmsi=vessel_mmsi)

        return qs.order_by("-created_at")
