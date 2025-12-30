from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('preferences/', views.notification_preferences, name='notification-preferences'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete-notification'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
]