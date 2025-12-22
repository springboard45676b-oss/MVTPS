from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer
from accounts.models import UserProfile


@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django!"})


@api_view(['POST'])
def login(request):
    """Login a user with email and password.

    Expected JSON: { 
        email, 
        password
    }
    """
    print(f'Received login data: {request.data}')
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.validated_data['user']
            profile = UserProfile.objects.get(user=user)
            
            # Get or create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': profile.role,
                'token': token.key,
                'message': f'Login successful as {profile.get_role_display()}'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f'Error during login: {str(e)}')
            return Response({
                'error': str(e),
                'message': 'Error during login'
            }, status=status.HTTP_400_BAD_REQUEST)
    print(f'Serializer errors: {serializer.errors}')
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register(request):
    """Register a new user with role.

    Expected JSON: { 
        username, 
        email, 
        password, 
        password2, 
        role (operator/admin/analyst),
        first_name?, 
        last_name? 
    }
    """
    print(f'Received registration data: {request.data}')
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            profile = UserProfile.objects.get(user=user)
            
            # Get or create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': profile.role,
                'token': token.key,
                'message': f'User registered successfully as {profile.get_role_display()}'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f'Error creating user: {str(e)}')
            return Response({
                'error': str(e),
                'message': 'Error creating user profile'
            }, status=status.HTTP_400_BAD_REQUEST)
    print(f'Serializer errors: {serializer.errors}')
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_roles(request):
    """Get available roles for registration."""
    roles = [
        {'value': 'operator', 'label': 'Operator'},
        {'value': 'admin', 'label': 'Admin'},
        {'value': 'analyst', 'label': 'Analyst'},
    ]
    return Response({'roles': roles}, status=status.HTTP_200_OK)



# Additional views for vessel data can be added here in the future.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Vessel
from .serializers import VesselSerializer


@api_view(['GET'])
def vessel_list(request):
    """
    GET /api/vessels/
    """
    vessels = Vessel.objects.all()
    serializer = VesselSerializer(vessels, many=True)
    return Response(serializer.data)


# Additional views for vessel data can be added here in the future.
from .models import VesselPosition
from .serializers import VesselPositionSerializer


@api_view(['GET'])
def vessel_positions(request, imo_number):
    """
    GET /api/vessels/{imo}/positions/
    """
    positions = VesselPosition.objects.filter(
        vessel__imo_number=imo_number
    ).order_by('-timestamp')

    serializer = VesselPositionSerializer(positions, many=True)
    return Response(serializer.data)
