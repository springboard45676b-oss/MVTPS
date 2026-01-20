from django.urls import path
from .views import notification_list, mark_notification_read, mark_all_read, notification_summary

urlpatterns = [
    path('', notification_list, name='notification-list'),
    path('<int:notification_id>/mark-read/', mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', mark_all_read, name='mark-all-read'),
    path('summary/', notification_summary, name='notification-summary'),
]