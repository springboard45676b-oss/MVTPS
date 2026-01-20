from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully. Please login with your credentials.',
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Get list of all users (admin only)"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    serializer = UserProfileSerializer(users, many=True)
    return Response({
        'users': serializer.data,
        'total_count': users.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Get detailed information for a specific user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Users can only view their own profile, admins can view any
        if request.user.id != user.id and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserProfileSerializer(user)
        
        # Add additional info for detailed view
        from vessels.models import VesselSubscription
        from notifications.models import Notification
        
        subscriptions = VesselSubscription.objects.filter(user=user)
        notifications = Notification.objects.filter(user=user).order_by('-created_at')[:5]
        
        response_data = serializer.data
        response_data.update({
            'vessel_subscriptions': subscriptions.count(),
            'total_notifications': notifications.count(),
            'recent_notifications': [
                {
                    'title': notif.title,
                    'message': notif.message,
                    'created_at': notif.created_at,
                    'is_read': notif.is_read
                } for notif in notifications
            ]
        })
        
        return Response(response_data)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.utils import timezone
    from datetime import timedelta
    
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    
    # Users joined in last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # Users by role
    roles = User.objects.values('role').distinct()
    role_counts = {}
    for role in roles:
        if role['role']:
            role_counts[role['role']] = User.objects.filter(role=role['role']).count()
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'staff_users': staff_users,
        'recent_users': recent_users,
        'role_distribution': role_counts
    })