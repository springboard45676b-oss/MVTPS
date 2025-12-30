from django.urls import path
from . import views

urlpatterns = [
    path('', views.VesselListView.as_view(), name='vessel-list'),
    path('<int:pk>/', views.VesselDetailView.as_view(), name='vessel-detail'),
    path('<int:vessel_id>/positions/', views.VesselPositionListView.as_view(), name='vessel-positions'),
    path('<int:vessel_id>/subscribe/', views.vessel_subscription, name='vessel-subscription'),
    path('subscriptions/', views.user_subscriptions, name='user-subscriptions'),
    path('live/', views.get_live_vessels, name='live-vessels'),
    path('update-live/', views.update_live_vessels, name='update-live-vessels'),
]