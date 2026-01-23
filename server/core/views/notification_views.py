"""
Notification & Subscription Management Views
Handles user notifications, vessel subscriptions, and alerts
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
import logging

from ..models import (
    Notification,
    VesselSubscription,
    VesselAlert,
    Vessel,
)
from ..serializers import (
    NotificationSerializer,
    VesselSubscriptionSerializer,
    VesselAlertSerializer,
)

logger = logging.getLogger(__name__)


# ============================================
# NOTIFICATION VIEWS - CRUD OPERATIONS
# ============================================

class UserNotificationsAPI(generics.ListAPIView):
    """
    Get all notifications for the authenticated user
    GET /api/users/notifications/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for current user - latest first"""
        return Notification.objects.filter(
            user=self.request.user
        ).select_related('vessel', 'event', 'user').order_by('-timestamp')
    
    def list(self, request, *args, **kwargs):
        """Override to add metadata"""
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'unread_count': unread_count,
            'results': serializer.data
        })


class NotificationDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a single notification
    GET /api/users/notifications/{id}/
    PATCH /api/users/notifications/{id}/ - Mark as read
    DELETE /api/users/notifications/{id}/ - Delete
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Update notification - only is_read field"""
        notification = self.get_object()
        
        if 'is_read' in request.data:
            notification.is_read = request.data.get('is_read', False)
            notification.save()
            logger.info(f"Notification {notification.id} marked as read by user {request.user.id}")
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a single notification"""
        notification = self.get_object()
        notification_id = notification.id
        notification.delete()
        
        logger.info(f"Notification {notification_id} deleted by user {request.user.id}")
        return Response(
            {
                'success': True,
                'message': 'Notification deleted successfully',
                'notification_id': notification_id
            },
            status=status.HTTP_204_NO_CONTENT
        )


class MarkNotificationAsReadAPI(APIView):
    """
    Mark a specific notification as read
    PATCH /api/users/notifications/{notification_id}/mark-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, notification_id):
        """Mark notification as read"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
            
            notification.mark_as_read()
            logger.info(f"Notification {notification_id} marked as read")
            
            serializer = NotificationSerializer(notification)
            return Response({
                'success': True,
                'message': 'Notification marked as read',
                'notification': serializer.data
            }, status=status.HTTP_200_OK)
        
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {request.user.id}")
            return Response(
                {'detail': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MarkAllNotificationsAsReadAPI(APIView):
    """
    Mark all unread notifications as read for the current user
    PATCH /api/users/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        """Mark all unread notifications as read"""
        try:
            updated_count = Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(is_read=True)
            
            logger.info(f"User {request.user.id} marked {updated_count} notifications as read")
            
            return Response({
                'success': True,
                'message': f'{updated_count} notifications marked as read',
                'updated_count': updated_count
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClearAllNotificationsAPI(APIView):
    """
    Delete all notifications for the current user
    DELETE /api/users/notifications/clear-all/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        """Delete all notifications for current user"""
        try:
            notifications = Notification.objects.filter(user=request.user)
            deleted_count = notifications.count()
            
            notifications.delete()
            
            logger.info(f"User {request.user.id} cleared {deleted_count} notifications")
            
            return Response({
                'success': True,
                'message': f'{deleted_count} notifications cleared',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error clearing notifications: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeleteNotificationAPI(APIView):
    """
    Delete a specific notification
    DELETE /api/users/notifications/{notification_id}/delete/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, notification_id):
        """Delete a single notification"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
            
            notification.delete()
            logger.info(f"Notification {notification_id} deleted by user {request.user.id}")
            
            return Response({
                'success': True,
                'message': 'Notification deleted',
                'deleted_id': notification_id
            }, status=status.HTTP_200_OK)
        
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {request.user.id}")
            return Response(
                {'detail': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================
# SUBSCRIPTION VIEWS
# ============================================

class UserVesselSubscriptionsAPI(generics.ListCreateAPIView):
    """List all vessel subscriptions for user or create a new subscription"""
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get subscriptions for current user"""
        return VesselSubscription.objects.filter(
            user=self.request.user
        ).select_related('vessel').order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create or toggle subscription"""
        try:
            vessel_id = request.data.get('vessel')
            alert_type = request.data.get('alert_type', 'all')
            
            if not vessel_id:
                return Response(
                    {'error': 'Vessel ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                vessel = Vessel.objects.get(id=vessel_id)
            except Vessel.DoesNotExist:
                return Response(
                    {'error': 'Vessel not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            subscription, created = VesselSubscription.objects.get_or_create(
                user=request.user,
                vessel=vessel,
                defaults={'alert_type': alert_type, 'is_active': True}
            )
            
            if not created:
                subscription.is_active = not subscription.is_active
                subscription.alert_type = alert_type
                subscription.save()
            
            serializer = VesselSubscriptionSerializer(subscription)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error in subscription create: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class VesselSubscriptionDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific vessel subscription"""
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own subscriptions"""
        return VesselSubscription.objects.filter(user=self.request.user)


# ============================================
# ALERT VIEWS
# ============================================

class UserAlertsAPI(generics.ListAPIView):
    """Get all vessel alerts for the authenticated user"""
    serializer_class = VesselAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get alerts for current user's subscriptions"""
        return VesselAlert.objects.filter(
            subscription__user=self.request.user
        ).select_related('subscription__vessel', 'subscription__user').order_by('-created_at')


class AlertMarkAsReadAPI(APIView):
    """Mark a specific alert as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, alert_id):
        """Mark alert as read"""
        try:
            alert = VesselAlert.objects.get(
                id=alert_id,
                subscription__user=request.user
            )
            alert.status = 'read'
            alert.read_at = timezone.now()
            alert.save()
            
            serializer = VesselAlertSerializer(alert)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except VesselAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )