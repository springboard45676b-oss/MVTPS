from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction
import logging

from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions_enhanced import IsAdminOnly
from .tokens import CustomRefreshToken

logger = logging.getLogger(__name__)

class SecureTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhanced JWT serializer with security logging"""
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to JWT token with validation"""
        token = super().get_token(user)
        
        # Validate user role
        if not hasattr(user, 'role') or user.role not in ['operator', 'analyst', 'admin']:
            raise ValidationError("Invalid user role")
        
        # Add secure claims
        token['role'] = user.role
        token['username'] = user.username
        token['iat'] = timezone.now().timestamp()
        
        return token
    
    def validate(self, attrs):
        """Enhanced validation with security checks"""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            logger.warning(f"Login attempt with missing credentials from IP: {self.context['request'].META.get('REMOTE_ADDR')}")
            raise ValidationError("Username and password are required")
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if not user:
            logger.warning(f"Failed login attempt for username: {username} from IP: {self.context['request'].META.get('REMOTE_ADDR')}")
            raise ValidationError("Invalid credentials")
        
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {username}")
            raise ValidationError("Account is disabled")
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Generate tokens
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
        
        logger.info(f"Successful login for user: {username} ({user.role}) from IP: {self.context['request'].META.get('REMOTE_ADDR')}")
        
        return data

class SecureTokenObtainPairView(TokenObtainPairView):
    """Secure login view with enhanced logging"""
    serializer_class = SecureTokenObtainPairSerializer

class SecureTokenRefreshView(TokenRefreshView):
    """Secure token refresh with validation"""
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            
            # Log successful token refresh
            logger.info(f"Token refreshed for IP: {request.META.get('REMOTE_ADDR')}")
            
            return response
        except (TokenError, InvalidToken) as e:
            logger.warning(f"Token refresh failed from IP: {request.META.get('REMOTE_ADDR')} - {str(e)}")
            return Response(
                {'error': 'Invalid or expired refresh token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class SecureRegisterView(APIView):
    """Enhanced registration with validation and logging"""
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        """Register new user with enhanced validation"""
        try:
            with transaction.atomic():
                serializer = RegisterSerializer(data=request.data)
                
                if not serializer.is_valid():
                    logger.warning(f"Registration failed - validation errors: {serializer.errors} from IP: {request.META.get('REMOTE_ADDR')}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                # Create user
                user = serializer.save()
                
                logger.info(f"New user registered: {user.username} ({user.role}) from IP: {request.META.get('REMOTE_ADDR')}")
                
                return Response({
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': user.role
                    },
                    'message': 'Registration successful. Please login with your credentials.'
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)} from IP: {request.META.get('REMOTE_ADDR')}")
            return Response(
                {'error': 'Registration failed. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SecureLogoutView(APIView):
    """Secure logout with token blacklisting"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user and blacklist refresh token"""
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                logger.info(f"User logged out: {request.user.username} from IP: {request.META.get('REMOTE_ADDR')}")
                
                return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
                
        except TokenError as e:
            logger.warning(f"Logout failed - invalid token from user: {request.user.username} - {str(e)}")
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Logout error for user: {request.user.username} - {str(e)}")
            return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SecureUserManagementView(APIView):
    """Enhanced admin-only user management"""
    permission_classes = [IsAdminOnly]
    
    def get(self, request):
        """Get all users with filtering (admin only)"""
        try:
            # Apply filters
            role_filter = request.query_params.get('role')
            is_active_filter = request.query_params.get('is_active')
            
            queryset = User.objects.all().order_by('-created_at')
            
            if role_filter and role_filter in ['operator', 'analyst', 'admin']:
                queryset = queryset.filter(role=role_filter)
            
            if is_active_filter is not None:
                is_active = is_active_filter.lower() == 'true'
                queryset = queryset.filter(is_active=is_active)
            
            serializer = UserSerializer(queryset, many=True)
            
            logger.info(f"User list accessed by admin: {request.user.username}")
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"User management error: {str(e)}")
            return Response(
                {'error': 'Failed to fetch users'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Update user role or status (admin only)"""
        try:
            user_id = request.data.get('user_id')
            new_role = request.data.get('role')
            is_active = request.data.get('is_active')
            
            if not user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Prevent admin from modifying their own role
            if user == request.user and new_role and new_role != user.role:
                return Response(
                    {'error': 'Cannot modify your own role'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update role if provided
            if new_role and new_role in ['operator', 'analyst', 'admin']:
                old_role = user.role
                user.role = new_role
                logger.info(f"User role updated by admin {request.user.username}: {user.username} from {old_role} to {new_role}")
            
            # Update active status if provided
            if is_active is not None:
                user.is_active = is_active
                logger.info(f"User status updated by admin {request.user.username}: {user.username} active={is_active}")
            
            user.save()
            
            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            logger.error(f"User update error: {str(e)}")
            return Response(
                {'error': 'Failed to update user'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SecureUserProfileView(APIView):
    """Secure user profile management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile (excluding sensitive fields)"""
        try:
            # Remove sensitive fields from update data
            data = request.data.copy()
            sensitive_fields = ['role', 'is_active', 'is_staff', 'is_superuser', 'password']
            
            for field in sensitive_fields:
                data.pop(field, None)
            
            serializer = UserSerializer(request.user, data=data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Profile updated for user: {request.user.username}")
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Profile update error for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to update profile'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )