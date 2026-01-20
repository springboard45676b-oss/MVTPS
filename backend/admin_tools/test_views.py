from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_admin_access(request):
    """Simple test endpoint to check admin access"""
    
    user = request.user
    
    return Response({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'is_admin': user.role == 'admin',
        'is_authenticated': user.is_authenticated,
        'message': f'Hello {user.username}! Your role is: {user.role}'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_simple(request):
    """Simplified admin dashboard without role check"""
    
    if request.user.role != 'admin':
        return Response({
            'error': 'Admin access required',
            'your_role': request.user.role,
            'required_role': 'admin'
        }, status=403)
    
    # Get user statistics
    user_stats = {
        'total_users': User.objects.count(),
        'operators': User.objects.filter(role='operator').count(),
        'analysts': User.objects.filter(role='analyst').count(),
        'admins': User.objects.filter(role='admin').count(),
    }
    
    return Response({
        'status': 'success',
        'message': f'Welcome admin {request.user.username}!',
        'user_stats': user_stats
    })