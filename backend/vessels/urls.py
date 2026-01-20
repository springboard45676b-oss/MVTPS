from django.urls import path
from . import views

urlpatterns = [
    path('', views.VesselListView.as_view(), name='vessel-list'),
    path('<int:pk>/', views.VesselDetailView.as_view(), name='vessel-detail'),
    path('<int:vessel_id>/positions/', views.VesselPositionListView.as_view(), name='vessel-positions'),
    path('<int:vessel_id>/track/', views.vessel_track, name='vessel-track'),
    path('<int:vessel_id>/subscribe/', views.vessel_subscription, name='vessel-subscription'),
    path('<int:vessel_id>/process-voyages/', views.process_vessel_voyages, name='process-vessel-voyages'),
    path('subscriptions/', views.user_subscriptions, name='user-subscriptions'),
    path('live/', views.get_live_vessels, name='live-vessels'),
    path('update-live/', views.update_live_vessels, name='update-live-vessels'),
    path('subscribe-live/', views.live_vessel_subscription, name='live-vessel-subscription'),
    path('unsubscribe-live/', views.live_vessel_unsubscription, name='live-vessel-unsubscription'),
    path('live-subscriptions/', views.user_live_subscriptions, name='user-live-subscriptions'),
    path('ais-status/', views.ais_streaming_status, name='ais-streaming-status'),
    path('ais-start/', views.start_ais_streaming, name='start-ais-streaming'),
    path('ais-stop/', views.stop_ais_streaming, name='stop-ais-streaming'),
    path('data-source-info/', views.data_source_info, name='data-source-info'),
    path('voyages/', views.VoyageListView.as_view(), name='voyage-list'),
    path('voyages/<int:pk>/', views.VoyageDetailView.as_view(), name='voyage-detail'),
    path('voyages/<int:voyage_id>/track/', views.vessel_voyage_track, name='voyage-track'),
    path('voyages/update-all/', views.update_all_voyages, name='update-all-voyages'),
    path('voyages/statistics/', views.voyage_statistics, name='voyage-statistics'),
    
    # Real-time data subscription endpoints
    path('realtime-subscriptions/', views.realtime_subscriptions, name='realtime-subscriptions'),
    path('realtime-subscriptions/<int:subscription_id>/', views.realtime_subscription_detail, name='realtime-subscription-detail'),
    path('realtime-subscriptions/<int:subscription_id>/toggle/', views.toggle_realtime_subscription, name='toggle-realtime-subscription'),
    path('realtime-subscriptions/stats/', views.realtime_subscription_stats, name='realtime-subscription-stats'),
]