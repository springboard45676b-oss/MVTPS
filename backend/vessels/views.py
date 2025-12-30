from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Vessel, VesselPosition, VesselSubscription
from .serializers import VesselSerializer, VesselPositionSerializer, VesselSubscriptionSerializer
from .marine_traffic_service import marine_traffic_service
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
        
        return Response({
            'vessels': live_vessels,
            'count': len(live_vessels),
            'timestamp': live_vessels[0]['timestamp'].isoformat() if live_vessels else None,
            'source': 'MarineTraffic API' if marine_traffic_service.api_key else 'Demo Data'
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