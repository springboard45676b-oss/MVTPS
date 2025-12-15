# from django.shortcuts import render

# # Create your views here.
# # accounts/views.py

# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import authenticate
# from django.contrib.auth.models import User
# from accounts.serializers import UserRegistrationSerializer, UserSerializer

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register_user(request):
#     """
#     Register a new user and return tokens
#     """
#     serializer = UserRegistrationSerializer(data=request.data)
    
#     if serializer.is_valid():
#         user = serializer.save()
        
#         # Generate JWT tokens
#         refresh = RefreshToken.for_user(user)
        
#         # Get user role
#         role = user.profile.role if hasattr(user, 'profile') else 'operator'
        
#         return Response({
#             'message': 'Registration successful',
#             'user': {
#                 'username': user.username,
#                 'email': user.email,
#                 'role': role
#             },
#             'tokens': {
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#             }
#         }, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login_user(request):
#     """
#     Login user with email/username and password, return JWT tokens
#     """
#     email_or_username = request.data.get('email')
#     password = request.data.get('password')
    
#     if not email_or_username or not password:
#         return Response({
#             'error': 'Please provide both email/username and password'
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # Try to find user by email first, then username
#     user = None
#     if '@' in email_or_username:
#         try:
#             user = User.objects.get(email=email_or_username)
#             user = authenticate(username=user.username, password=password)
#         except User.DoesNotExist:
#             pass
#     else:
#         user = authenticate(username=email_or_username, password=password)
    
#     if user is not None:
#         # Generate JWT tokens
#         refresh = RefreshToken.for_user(user)
        
#         # Get user role
#         role = user.profile.role if hasattr(user, 'profile') else 'operator'
        
#         return Response({
#             'message': 'Login successful',
#             'user': {
#                 'username': user.username,
#                 'email': user.email,
#                 'role': role
#             },
#             'tokens': {
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#             },
#             # Also return in old format for compatibility
#             'token': str(refresh.access_token),
#             'role': role,
#             'username': user.username
#         }, status=status.HTTP_200_OK)
    
#     return Response({
#         'error': 'Invalid credentials'
#     }, status=status.HTTP_401_UNAUTHORIZED)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout_user(request):
#     """
#     Logout user by blacklisting the refresh token
#     """
#     try:
#         refresh_token = request.data.get('refresh_token')
#         if refresh_token:
#             token = RefreshToken(refresh_token)
#             token.blacklist()
        
#         return Response({
#             'message': 'Logout successful'
#         }, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response({
#             'error': str(e)
#         }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_user_profile(request):
#     """
#     Get current user profile
#     """
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)




from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from accounts.serializers import UserRegistrationSerializer, UserSerializer
import traceback


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user and return tokens
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Get user role
            role = user.profile.role if hasattr(user, 'profile') else 'operator'
            
            response_data = {
                'message': 'Registration successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'role': role
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
            
            print("✅ Registration successful:", response_data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        print("❌ Registration validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print("❌ Registration error:", str(e))
        traceback.print_exc()
        return Response({
            'error': 'Registration failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user with email/username and password, return JWT tokens
    """
    try:
        email_or_username = request.data.get('email')
        password = request.data.get('password')
        
        print(f"🔐 Login attempt - Email/Username: {email_or_username}")
        
        if not email_or_username or not password:
            return Response({
                'error': 'Please provide both email/username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find user by email first, then username
        user = None
        if '@' in email_or_username:
            try:
                user_obj = User.objects.get(email=email_or_username)
                user = authenticate(username=user_obj.username, password=password)
                print(f"✅ Found user by email: {user_obj.username}")
            except User.DoesNotExist:
                print(f"❌ No user found with email: {email_or_username}")
                pass
        else:
            user = authenticate(username=email_or_username, password=password)
            print(f"✅ Authenticated with username: {email_or_username}")
        
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Get user role (with fallback)
            try:
                role = user.profile.role if hasattr(user, 'profile') else 'operator'
            except Exception as e:
                print(f"⚠️ Could not get user profile, using default role: {e}")
                role = 'operator'
            
            response_data = {
                'message': 'Login successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'role': role
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                # Also include in root for backward compatibility
                'token': str(refresh.access_token),
                'role': role,
                'username': user.username
            }
            
            print(f"✅ Login successful - User: {user.username}, Role: {role}")
            print(f"✅ Response data: {response_data}")
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        print("❌ Authentication failed - Invalid credentials")
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': 'Login failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by blacklisting the refresh token
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user profile
    """
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add this test endpoint to check if everything is working
@api_view(['GET'])
@permission_classes([AllowAny])
def test_api(request):
    """
    Test endpoint to verify API is working
    """
    return Response({
        'message': 'API is working!',
        'endpoints': {
            'register': '/api/register/',
            'login': '/api/login/',
            'logout': '/api/logout/',
            'profile': '/api/profile/',
            'refresh': '/api/token/refresh/'
        }
    }, status=status.HTTP_200_OK)