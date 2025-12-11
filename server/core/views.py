from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, update_session_auth_hash
from django.urls import reverse
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer
)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request, format=None):
    """
    Root API endpoint that lists all available endpoints
    """
    base_url = request.build_absolute_uri('/')
    return Response({
        'register': {
            'url': base_url + 'api/auth/register/',
            'method': 'POST',
            'description': 'Register a new user (Operator/Analyst/Admin)',
            'required_fields': {
                'username': 'string (unique)',
                'email': 'string (unique)',
                'password': 'string',
                'password2': 'string (must match password)',
                'role': 'string (operator, analyst, or admin)'
            }
        },
        'login': {
            'url': base_url + 'api/auth/login/',
            'method': 'POST',
            'description': 'Get JWT tokens (login with username or email)',
            'required_fields': {
                'username': 'string (username or email)',
                'password': 'string'
            }
        },
        'token_refresh': {
            'url': base_url + 'api/auth/refresh/',
            'method': 'POST',
            'description': 'Refresh access token',
            'required_fields': {
                'refresh': 'string (refresh token)'
            }
        },
        'admin': {
            'url': base_url + 'admin/',
            'description': 'Django admin interface'
        }
    })

User = get_user_model()

import logging
logger = logging.getLogger(__name__)

class RegisterAPI(generics.CreateAPIView):
    """
    Register a new user with the given email, full name, password, and role.
    Allows registration for 'operator', 'analyst', and 'admin' roles.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Registration attempt with data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        
        # Get token for the registered user
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

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id', 'role')

    def update(self, instance, validated_data):
        # Handle password update if provided
        password = self.context.get('request').data.get('password')
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class UserProfileAPI(generics.RetrieveUpdateAPIView):
    """
    Get or update the current user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Update session auth hash if password was changed
            if 'password' in request.data:
                update_session_auth_hash(request, user)
            
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that uses our custom serializer
    which includes user data in the response.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # is_active is now a property that always returns True
        # No need to check it separately
        return response 