from django.urls import path
from .views import (
    VesselListView,
    VesselDetailView,
    VesselRouteView,
    VesselAlertSubscriptionListCreateView,
    VesselAlertSubscriptionDetailView,
    VesselAlertTriggerListView,
    UserVesselSubscriptionListCreateView,
    UserVesselSubscriptionDetailView,
    UserVesselAlertListView,
)

urlpatterns = [
    # List vessels
    path("vessels/", VesselListView.as_view(), name="vessel-list"),

    # MMSI-based vessel detail and route
    path("vessels/<str:mmsi>/", VesselDetailView.as_view(), name="vessel-detail"),
    path("vessels/<str:mmsi>/route/", VesselRouteView.as_view(), name="vessel-route"),

    # Legacy alert subscription and triggers (VesselAlertSubscription / VesselAlertTrigger)
    path(
        "vessels/alerts/subscriptions/",
        VesselAlertSubscriptionListCreateView.as_view(),
        name="vessel-alert-subscriptions",
    ),
    path(
        "vessels/alerts/subscriptions/<int:pk>/",
        VesselAlertSubscriptionDetailView.as_view(),
        name="vessel-alert-subscription-detail",
    ),
    path(
        "vessels/alerts/triggers/",
        VesselAlertTriggerListView.as_view(),
        name="vessel-alert-triggers",
    ),

    # New subscription and alert endpoints (VesselSubscription / VesselAlert)
    path(
        "vessels/subscriptions/",
        UserVesselSubscriptionListCreateView.as_view(),
        name="user-vessel-subscriptions",
    ),
    path(
        "vessels/subscriptions/<int:pk>/",
        UserVesselSubscriptionDetailView.as_view(),
        name="user-vessel-subscription-detail",
    ),
    path(
        "vessels/alerts/",
        UserVesselAlertListView.as_view(),
        name="user-vessel-alerts",
    ),
]
