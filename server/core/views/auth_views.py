"""
Authentication & User Profile Views
Handles user registration, login, and profile management
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, update_session_auth_hash
from rest_framework.parsers import MultiPartParser, FormParser
import logging

from ..serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileUpdateSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


# ============================================
# API ROOT
# ============================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request, format=None):
    """Root API endpoint that lists all available endpoints"""
    base_url = request.build_absolute_uri('/')
    return Response({
        'auth': {
            'register': base_url + 'api/auth/register/',
            'login': base_url + 'api/auth/login/',
            'refresh': base_url + 'api/auth/refresh/',
            'profile': base_url + 'api/auth/profile/',
            'profile_edit': base_url + 'api/auth/profile/edit/',
        },
        'vessels': {
            'list': base_url + 'api/vessels/',
            'detail': base_url + 'api/vessels/{id}/',
            'positions': base_url + 'api/vessels/{id}/positions/',
            'current_position': base_url + 'api/vessels/{id}/current-position/',
            'stats': base_url + 'api/vessels/{id}/stats/',
            'update_position': base_url + 'api/vessels/{id}/update-position/',
            'bulk_positions': base_url + 'api/vessels/bulk/current-positions/',
        },
        'notifications': {
            'list': base_url + 'api/users/notifications/',
            'detail': base_url + 'api/users/notifications/{id}/',
            'mark_read': base_url + 'api/users/notifications/{id}/mark-read/',
            'mark_all_read': base_url + 'api/users/notifications/mark-all-read/',
            'delete_one': base_url + 'api/users/notifications/{id}/delete/',
            'clear_all': base_url + 'api/users/notifications/clear-all/',
        },
        'subscriptions': {
            'list': base_url + 'api/users/subscriptions/',
            'detail': base_url + 'api/users/subscriptions/{id}/',
            'alerts': base_url + 'api/users/alerts/',
            'mark_alert_read': base_url + 'api/alerts/{id}/mark-read/',
        },
        'data_generation': {
            'generate_mock': base_url + 'api/generate-realistic-mock-data/',
        }
    })


# ============================================
# AUTHENTICATION VIEWS
# ============================================

class RegisterAPI(generics.CreateAPIView):
    """Register a new user"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Registration attempt")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        
        token_serializer = CustomTokenObtainPairSerializer(data={
            'username': user.username,
            'password': request.data.get('password')
        })
        token_serializer.is_valid(raise_exception=True)
        
        token_data = token_serializer.validated_data
        
        return Response({
            'user': UserSerializer(user).data,
            'access': token_data.get('access'),
            'refresh': token_data.get('refresh'),
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response


# ============================================
# USER PROFILE VIEWS
# ============================================

class UserProfileAPI(generics.RetrieveAPIView):
    """Get the current user's profile information"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateAPI(generics.UpdateAPIView):
    """Update the current user's profile"""
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        logger.info(f"Profile update request for user {user.username}")
        
        serializer = self.get_serializer(
            user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            if 'password' in request.data and request.data.get('password'):
                update_session_auth_hash(request, user)
            
            logger.info(f"Profile updated successfully for user {user.username}")
            
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at,
            }
            
            return Response({
                'message': 'Profile updated successfully',
                'user': response_data
            }, status=status.HTTP_200_OK)
        
        logger.error(f"Profile update validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)