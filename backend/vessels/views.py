from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import Vessel, VesselPosition, VesselSubscription, LiveVesselSubscription, Voyage, RealTimeDataSubscription
from .serializers import VesselSerializer, VesselPositionSerializer, VesselSubscriptionSerializer, VoyageSerializer, RealTimeDataSubscriptionSerializer
from .marine_traffic_service import marine_traffic_service
from .voyage_tracker import voyage_tracker
from notifications.services import notification_service

class VesselListView(generics.ListAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    
    def get_queryset(self):
        queryset = Vessel.objects.all()
        vessel_type = self.request.query_params.get('type')
        flag = self.request.query_params.get('flag')
        search = self.request.query_params.get('search')
        
        if vessel_type:
            queryset = queryset.filter(vessel_type=vessel_type)
        if flag:
            queryset = queryset.filter(flag__icontains=flag)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

class VesselDetailView(generics.RetrieveAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer

class VesselPositionListView(generics.ListAPIView):
    serializer_class = VesselPositionSerializer
    
    def get_queryset(self):
        vessel_id = self.kwargs['vessel_id']
        return VesselPosition.objects.filter(vessel_id=vessel_id)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_live_vessels(request):
    """
    Fetch and update live vessel data from MarineTraffic
    """
    try:
        # Get bounds from request if provided
        bounds = None
        if request.data:
            bounds = {
                'minlat': request.data.get('minlat'),
                'maxlat': request.data.get('maxlat'),
                'minlon': request.data.get('minlon'),
                'maxlon': request.data.get('maxlon'),
            }
            # Remove None values
            bounds = {k: v for k, v in bounds.items() if v is not None}
            if not bounds:
                bounds = None
        
        updated_count = marine_traffic_service.update_vessel_positions(bounds)
        
        return Response({
            'message': f'Successfully updated {updated_count} vessels',
            'updated_count': updated_count,
            'timestamp': marine_traffic_service._get_demo_live_data()[0]['timestamp'].isoformat() if updated_count > 0 else None
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to update vessel data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_live_vessels(request):
    """
    Get live vessel data directly from MarineTraffic (without saving to DB)
    """
    try:
        # Get bounds from query parameters
        bounds = None
        minlat = request.GET.get('minlat')
        maxlat = request.GET.get('maxlat')
        minlon = request.GET.get('minlon')
        maxlon = request.GET.get('maxlon')
        
        if all([minlat, maxlat, minlon, maxlon]):
            bounds = {
                'minlat': float(minlat),
                'maxlat': float(maxlat),
                'minlon': float(minlon),
                'maxlon': float(maxlon),
            }
        
        live_vessels = marine_traffic_service.get_live_vessels(bounds)
        
        # Get user's live subscriptions
        user_subscriptions = set(
            LiveVesselSubscription.objects.filter(
                user=request.user, 
                is_active=True
            ).values_list('mmsi', flat=True)
        )
        
        # Add subscription status to each vessel
        for vessel in live_vessels:
            vessel['is_subscribed'] = str(vessel.get('mmsi', '')) in user_subscriptions
        
        # Apply filters
        vessel_type = request.GET.get('type')
        flag = request.GET.get('flag')
        search = request.GET.get('search')
        
        if vessel_type:
            live_vessels = [v for v in live_vessels if vessel_type.lower() in (v.get('vessel_type', '') or v.get('type', '')).lower()]
        
        if flag:
            live_vessels = [v for v in live_vessels if flag.lower() in (v.get('flag', '')).lower()]
        
        if search:
            live_vessels = [v for v in live_vessels if 
                          search.lower() in (v.get('name', '')).lower() or 
                          search in str(v.get('mmsi', ''))]
        
        return Response({
            'vessels': live_vessels,
            'count': len(live_vessels),
            'timestamp': live_vessels[0]['timestamp'].isoformat() if live_vessels else None,
            'source': 'Database Vessels (Demo Data)' if not live_vessels else 'Live Data'
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to fetch live vessel data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def vessel_subscription(request, vessel_id):
    vessel = get_object_or_404(Vessel, id=vessel_id)
    
    if request.method == 'POST':
        subscription, created = VesselSubscription.objects.get_or_create(
            user=request.user, vessel=vessel
        )
        if created:
            # Create notification for successful subscription
            notification_service.notify_subscription_created(request.user, vessel)
            return Response({'message': 'Subscribed successfully'})
        return Response({'message': 'Already subscribed'})
    
    elif request.method == 'DELETE':
        try:
            subscription = VesselSubscription.objects.get(
                user=request.user, vessel=vessel
            )
            subscription.delete()
            return Response({'message': 'Unsubscribed successfully'})
        except VesselSubscription.DoesNotExist:
            return Response({'message': 'Not subscribed'}, 
                          status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_subscriptions(request):
    subscriptions = VesselSubscription.objects.filter(user=request.user)
    serializer = VesselSubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def live_vessel_subscription(request):
    """Subscribe to live vessel updates by MMSI"""
    mmsi = request.data.get('mmsi')
    vessel_name = request.data.get('vessel_name', '')
    
    if not mmsi:
        return Response({'error': 'MMSI is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        subscription, created = LiveVesselSubscription.objects.get_or_create(
            user=request.user,
            mmsi=mmsi,
            defaults={'vessel_name': vessel_name}
        )
        
        if created:
            # Create notification for successful subscription
            notification_service.create_notification(
                user=request.user,
                title=f"Subscribed to Live Vessel",
                message=f"You will now receive live updates for vessel {vessel_name or mmsi}",
                notification_type='subscription_created'
            )
            return Response({'message': 'Subscribed to live vessel successfully'})
        else:
            return Response({'message': 'Already subscribed to this vessel'})
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def live_vessel_unsubscription(request):
    """Unsubscribe from live vessel updates by MMSI"""
    mmsi = request.data.get('mmsi')
    
    if not mmsi:
        return Response({'error': 'MMSI is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        subscription = LiveVesselSubscription.objects.get(
            user=request.user,
            mmsi=mmsi
        )
        vessel_name = subscription.vessel_name
        subscription.delete()
        
        return Response({'message': f'Unsubscribed from {vessel_name or mmsi} successfully'})
        
    except LiveVesselSubscription.DoesNotExist:
        return Response({'message': 'Not subscribed to this vessel'}, 
                      status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_live_subscriptions(request):
    """Get user's live vessel subscriptions"""
    subscriptions = LiveVesselSubscription.objects.filter(user=request.user, is_active=True)
    
    data = []
    for sub in subscriptions:
        data.append({
            'id': sub.id,
            'mmsi': sub.mmsi,
            'vessel_name': sub.vessel_name,
            'position_updates': sub.position_updates,
            'destination_alerts': sub.destination_alerts,
            'status_changes': sub.status_changes,
            'update_frequency': sub.update_frequency,
            'created_at': sub.created_at,
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ais_streaming_status(request):
    """
    Get AIS streaming status
    """
    try:
        status_info = marine_traffic_service.get_streaming_status()
        return Response(status_info)
    except Exception as e:
        return Response({
            'error': f'Failed to get streaming status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_ais_streaming(request):
    """
    Start AIS streaming service
    """
    try:
        # Get bounds from request if provided
        bounds = None
        if request.data:
            bounds = {
                'minlat': request.data.get('minlat'),
                'maxlat': request.data.get('maxlat'),
                'minlon': request.data.get('minlon'),
                'maxlon': request.data.get('maxlon'),
            }
            # Remove None values
            bounds = {k: v for k, v in bounds.items() if v is not None}
            if not bounds:
                bounds = None
        
        success = marine_traffic_service.start_ais_streaming(bounds)
        
        if success:
            return Response({
                'message': 'AIS streaming started successfully',
                'bounds': bounds
            })
        else:
            return Response({
                'error': 'AIS streaming not available (API key not configured)'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to start AIS streaming: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_ais_streaming(request):
    """
    Stop AIS streaming service
    """
    try:
        success = marine_traffic_service.stop_ais_streaming()
        
        if success:
            return Response({
                'message': 'AIS streaming stopped successfully'
            })
        else:
            return Response({
                'error': 'AIS streaming not available'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to stop AIS streaming: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Voyage endpoints
class VoyageListView(generics.ListAPIView):
    serializer_class = VoyageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Voyage.objects.all()
        vessel_id = self.request.query_params.get('vessel_id')
        status_filter = self.request.query_params.get('status')
        
        if vessel_id:
            queryset = queryset.filter(vessel_id=vessel_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset

class VoyageDetailView(generics.RetrieveAPIView):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_vessel_voyages(request, vessel_id):
    """
    Process and create voyages for a specific vessel based on its position history
    """
    try:
        vessel = get_object_or_404(Vessel, id=vessel_id)
        voyages = voyage_tracker.process_vessel_positions(vessel)
        
        return Response({
            'message': f'Processed voyages for {vessel.name}',
            'voyages_created': len(voyages),
            'vessel': vessel.name
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to process voyages: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_all_voyages(request):
    """
    Update voyages for all vessels
    """
    try:
        vessels = Vessel.objects.all()
        total_voyages = 0
        
        for vessel in vessels:
            voyages = voyage_tracker.process_vessel_positions(vessel)
            total_voyages += len(voyages)
        
        # Update active voyages
        updated_active = voyage_tracker.update_active_voyages()
        
        return Response({
            'message': 'Updated voyages for all vessels',
            'total_voyages_created': total_voyages,
            'active_voyages_updated': updated_active,
            'vessels_processed': vessels.count()
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to update voyages: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voyage_statistics(request):
    """
    Get voyage statistics
    """
    try:
        vessel_id = request.query_params.get('vessel_id')
        vessel = None
        
        if vessel_id:
            vessel = get_object_or_404(Vessel, id=vessel_id)
        
        stats = voyage_tracker.get_voyage_statistics(vessel)
        
        return Response({
            'statistics': stats,
            'vessel': vessel.name if vessel else 'All vessels'
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get statistics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def data_source_info(request):
    """
    Get information about current data sources (real vs demo)
    """
    try:
        # Demo vessel MMSIs
        demo_mmsis = ['636019825', '353136000', '477995300', '311000274', '636017894']
        
        vessels = Vessel.objects.all()
        demo_vessels = vessels.filter(mmsi__in=demo_mmsis)
        real_vessels = vessels.exclude(mmsi__in=demo_mmsis)
        
        # Get streaming status
        streaming_status = marine_traffic_service.get_streaming_status()
        
        # Recent positions
        recent_positions = VesselPosition.objects.order_by('-timestamp')[:10]
        
        return Response({
            'data_sources': {
                'total_vessels': vessels.count(),
                'demo_vessels': demo_vessels.count(),
                'real_vessels': real_vessels.count(),
                'demo_vessel_names': [v.name for v in demo_vessels],
                'real_vessel_names': [v.name for v in real_vessels[:10]]  # First 10
            },
            'streaming_status': streaming_status,
            'recent_activity': {
                'latest_position_time': recent_positions[0].timestamp if recent_positions else None,
                'positions_last_hour': VesselPosition.objects.filter(
                    timestamp__gte=timezone.now() - timedelta(hours=1)
                ).count()
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get data source info: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vessel_track(request, vessel_id):
    """
    Get position track for a specific vessel
    """
    try:
        vessel = get_object_or_404(Vessel, id=vessel_id)
        limit = int(request.query_params.get('limit', 100))
        
        positions = VesselPosition.objects.filter(vessel=vessel).order_by('-timestamp')[:limit]
        
        track_data = []
        for pos in positions:
            track_data.append({
                'timestamp': pos.timestamp,
                'latitude': pos.latitude,
                'longitude': pos.longitude,
                'speed': pos.speed,
                'course': pos.course,
                'heading': pos.heading,
                'status': pos.status
            })
        
        return Response({
            'vessel': {
                'id': vessel.id,
                'name': vessel.name,
                'mmsi': vessel.mmsi,
                'type': vessel.vessel_type
            },
            'track': track_data,
            'total_positions': len(track_data)
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get vessel track: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vessel_voyage_track(request, voyage_id):
    """
    Get position track for a specific voyage
    """
    try:
        voyage = get_object_or_404(Voyage, id=voyage_id)
        
        # Get positions within voyage timeframe
        positions_query = VesselPosition.objects.filter(
            vessel=voyage.vessel,
            timestamp__gte=voyage.start_time
        )
        
        if voyage.end_time:
            positions_query = positions_query.filter(timestamp__lte=voyage.end_time)
        
        positions = positions_query.order_by('timestamp')
        
        track_data = []
        for pos in positions:
            track_data.append({
                'timestamp': pos.timestamp,
                'latitude': pos.latitude,
                'longitude': pos.longitude,
                'speed': pos.speed,
                'course': pos.course,
                'heading': pos.heading,
                'status': pos.status
            })
        
        return Response({
            'voyage': VoyageSerializer(voyage).data,
            'track': track_data,
            'total_positions': len(track_data)
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get voyage track: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Real-time Data Subscription Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def realtime_subscriptions(request):
    """
    Get user's real-time subscriptions or create a new one
    """
    if request.method == 'GET':
        subscriptions = RealTimeDataSubscription.objects.filter(user=request.user)
        serializer = RealTimeDataSubscriptionSerializer(subscriptions, many=True)
        return Response({
            'subscriptions': serializer.data,
            'count': subscriptions.count()
        })
    
    elif request.method == 'POST':
        serializer = RealTimeDataSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            subscription = serializer.save(user=request.user)
            
            # Create notification for new subscription
            from notifications.services import notification_service
            notification_service.notify_realtime_subscription_created(request.user, subscription)
            
            return Response(
                RealTimeDataSubscriptionSerializer(subscription).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def realtime_subscription_detail(request, subscription_id):
    """
    Get, update, or delete a specific real-time subscription
    """
    try:
        subscription = RealTimeDataSubscription.objects.get(
            id=subscription_id, user=request.user
        )
    except RealTimeDataSubscription.DoesNotExist:
        return Response(
            {'error': 'Subscription not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = RealTimeDataSubscriptionSerializer(subscription)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RealTimeDataSubscriptionSerializer(
            subscription, data=request.data, partial=True
        )
        if serializer.is_valid():
            subscription = serializer.save()
            
            # Create notification for subscription update
            from notifications.services import notification_service
            notification_service.notify_realtime_subscription_updated(request.user, subscription)
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        subscription.delete()
        
        # Create notification for subscription deletion
        from notifications.services import notification_service
        notification_service.notify_realtime_subscription_deleted(request.user)
        
        return Response({'message': 'Subscription deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_realtime_subscription(request, subscription_id):
    """
    Toggle active status of a real-time subscription
    """
    try:
        subscription = RealTimeDataSubscription.objects.get(
            id=subscription_id, user=request.user
        )
        subscription.is_active = not subscription.is_active
        subscription.save()
        
        status_text = 'activated' if subscription.is_active else 'deactivated'
        
        # Create notification
        from notifications.services import notification_service
        notification_service.notify_realtime_subscription_toggled(
            request.user, subscription, subscription.is_active
        )
        
        return Response({
            'message': f'Subscription {status_text} successfully',
            'is_active': subscription.is_active
        })
        
    except RealTimeDataSubscription.DoesNotExist:
        return Response(
            {'error': 'Subscription not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def realtime_subscription_stats(request):
    """
    Get statistics about user's real-time subscriptions
    """
    user_subscriptions = RealTimeDataSubscription.objects.filter(user=request.user)
    
    stats = {
        'total_subscriptions': user_subscriptions.count(),
        'active_subscriptions': user_subscriptions.filter(is_active=True).count(),
        'subscription_types': {},
        'notification_preferences': {
            'email': user_subscriptions.filter(email_notifications=True).count(),
            'push': user_subscriptions.filter(push_notifications=True).count(),
            'sms': user_subscriptions.filter(sms_notifications=True).count(),
        },
        'coverage_areas': []
    }
    
    # Count by subscription type
    for sub_type, _ in RealTimeDataSubscription.SUBSCRIPTION_TYPES:
        count = user_subscriptions.filter(subscription_type=sub_type).count()
        stats['subscription_types'][sub_type] = count
    
    # Get coverage areas for regional subscriptions
    regional_subs = user_subscriptions.filter(subscription_type='region')
    for sub in regional_subs:
        if all([sub.min_latitude, sub.max_latitude, sub.min_longitude, sub.max_longitude]):
            stats['coverage_areas'].append({
                'id': sub.id,
                'bounds': {
                    'min_lat': sub.min_latitude,
                    'max_lat': sub.max_latitude,
                    'min_lon': sub.min_longitude,
                    'max_lon': sub.max_longitude,
                }
            })
    
    return Response(stats)