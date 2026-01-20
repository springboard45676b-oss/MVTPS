from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db import models
from datetime import timedelta
from .models import Notification
from .serializers import NotificationSerializer
from permissions import VesselTrackingPermission

class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([VesselTrackingPermission])
def notification_list(request):
    """
    Get notifications for authenticated user
    """
    # Filter parameters
    is_read = request.GET.get('is_read')
    notification_type = request.GET.get('type')
    severity = request.GET.get('severity')
    hours = request.GET.get('hours', 168)  # Default 1 week
    
    # Base queryset - global notifications or user-specific
    queryset = Notification.objects.filter(
        models.Q(user=request.user) | models.Q(user__isnull=True)
    ).select_related('vessel', 'port')
    
    # Apply filters
    if is_read is not None:
        queryset = queryset.filter(is_read=is_read.lower() == 'true')
    
    if notification_type:
        queryset = queryset.filter(notification_type=notification_type)
    
    if severity:
        queryset = queryset.filter(severity=severity)
    
    # Time filter
    try:
        hours_int = int(hours)
        cutoff_time = timezone.now() - timedelta(hours=hours_int)
        queryset = queryset.filter(created_at__gte=cutoff_time)
    except ValueError:
        pass
    
    # Pagination
    paginator = NotificationPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = NotificationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = NotificationSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([VesselTrackingPermission])
def mark_notification_read(request, notification_id):
    """
    Mark specific notification as read
    """
    try:
        notification = Notification.objects.get(
            models.Q(user=request.user) | models.Q(user__isnull=True),
            id=notification_id
        )
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read',
            'notification_id': notification_id
        })
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([VesselTrackingPermission])
def mark_all_read(request):
    """
    Mark all notifications as read for user
    """
    updated_count = Notification.objects.filter(
        models.Q(user=request.user) | models.Q(user__isnull=True)
    ).filter(
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{updated_count} notifications marked as read',
        'count': updated_count
    })

@api_view(['GET'])
@permission_classes([VesselTrackingPermission])
def notification_summary(request):
    """
    Get notification summary for user
    """
    # Count unread notifications
    unread_count = Notification.objects.filter(
        models.Q(user=request.user) | models.Q(user__isnull=True)
    ).filter(
        is_read=False
    ).count()
    
    # Count by severity (unread only)
    severity_counts = {}
    for severity, _ in Notification.SEVERITY_LEVELS:
        count = Notification.objects.filter(
            models.Q(user=request.user) | models.Q(user__isnull=True)
        ).filter(
            severity=severity,
            is_read=False
        ).count()
        severity_counts[severity] = count
    
    # Recent notifications (last 24h)
    recent_count = Notification.objects.filter(
        models.Q(user=request.user) | models.Q(user__isnull=True),
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    return Response({
        'unread_count': unread_count,
        'recent_count': recent_count,
        'severity_counts': severity_counts,
        'timestamp': timezone.now()
    })
