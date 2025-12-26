from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from datetime import datetime, timedelta

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """Get admin dashboard data with real user statistics"""
    
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    # Get user statistics
    user_stats = User.objects.aggregate(
        total=Count('id'),
        operators=Count('id', filter=Q(role='operator')),
        analysts=Count('id', filter=Q(role='analyst')),
        admins=Count('id', filter=Q(role='admin'))
    )
    
    # Get recent user registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # System health metrics (you can expand these based on your needs)
    system_stats = {
        'api_sources': 12,  # You can make this dynamic
        'active_sources': 10,
        'uptime': '99.8%',
        'recent_errors': 3,
        'recent_registrations': recent_users
    }
    
    return Response({
        'status': 'success',
        'data': {
            'users': user_stats,
            'system': system_stats,
            'last_updated': datetime.now().isoformat()
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Get list of all users for admin management"""
    
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    users = User.objects.all().values(
        'id', 'username', 'email', 'role', 'company', 
        'date_joined', 'last_login', 'is_active'
    ).order_by('-date_joined')
    
    return Response({
        'status': 'success',
        'data': list(users)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_role(request):
    """Update user role (admin only)"""
    
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    user_id = request.data.get('user_id')
    new_role = request.data.get('role')
    
    if not user_id or not new_role:
        return Response({'error': 'user_id and role are required'}, status=400)
    
    if new_role not in ['operator', 'analyst', 'admin']:
        return Response({'error': 'Invalid role'}, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        user.role = new_role
        user.save()
        
        return Response({
            'status': 'success',
            'message': f'User role updated to {new_role}'
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)