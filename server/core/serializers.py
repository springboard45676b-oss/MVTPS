from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'created_at')
        read_only_fields = ('id', 'created_at', 'role')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'  # Allow username or email
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        # Try to authenticate with username first
        user = authenticate(request=self.context.get('request'), username=username_or_email, password=password)
        
        # If that fails, try with email
        if not user and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError("Invalid username/email or password.")
        
        refresh = self.get_token(user)
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add custom claims
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        return data

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all(), message='A user with this username already exists.')],
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message='A user with this email already exists.')]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=[User.ROLE_OPERATOR, User.ROLE_ANALYST, User.ROLE_ADMIN],
        error_messages={
            'invalid_choice': 'Role must be either "operator", "analyst", or "admin".',
        }
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role')

    def validate_username(self, value):
        # Use Django's username validator
        from django.contrib.auth.validators import UnicodeUsernameValidator
        validator = UnicodeUsernameValidator()
        try:
            validator(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 from the data
        validated_data.pop('password2', None)
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.ROLE_OPERATOR)
        )
        return user