from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.urls import reverse

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
            'description': 'Register a new user (Operator/Analyst)',
            'required_fields': {
                'email': 'string',
                'full_name': 'string',
                'password': 'string',
                'password2': 'string (must match password)',
                'role': 'string (operator or analyst)'
            }
        },
        'login': {
            'url': base_url + 'api/auth/login/',
            'method': 'POST',
            'description': 'Get JWT tokens',
            'required_fields': {
                'email': 'string',
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
    Only allows registration for 'operator' and 'analyst' roles.
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
            'email': user.email,
            'password': request.data.get('password')
        })
        token_serializer.is_valid(raise_exception=True)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': token_serializer.validated_data
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that uses our custom serializer
    which includes user data in the response.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # If login is successful, check if user is active
        if response.status_code == 200:
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    return Response(
                        {"detail": "This account is inactive."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except User.DoesNotExist:
                pass
                
        return response