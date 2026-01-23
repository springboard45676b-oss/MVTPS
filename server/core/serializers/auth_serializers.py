"""
Authentication & User Serializers
Handles user registration, login, and profile management
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User information serializer for profile viewing"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'created_at')
        read_only_fields = ('id', 'created_at', 'role')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with role validation"""
    
    username_field = 'username'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['selected_role'] = serializers.CharField(
            required=False,
            allow_blank=True,
            help_text='The role user is trying to login with (operator, analyst, admin)'
        )
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        selected_role = attrs.pop('selected_role', None)
        
        user = authenticate(request=self.context.get('request'), username=username_or_email, password=password)
        
        if not user and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError("Invalid username/email or password.")
        
        if selected_role:
            if user.role != selected_role:
                raise serializers.ValidationError(
                    f"Your account is registered as '{user.role.title()}', "
                    f"but you're trying to login as '{selected_role.title()}'. "
                    f"Please select the correct role and try again."
                )
        
        refresh = self.get_token(user)
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    
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
        validated_data.pop('password2', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.ROLE_OPERATOR)
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """User profile update serializer with role-based permissions"""
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    username = serializers.CharField(
        required=False,
        max_length=150,
        validators=[UniqueValidator(
            queryset=User.objects.all(), 
            message='A user with this username already exists.'
        )],
    )
    
    email = serializers.EmailField(
        required=False,
        validators=[UniqueValidator(
            queryset=User.objects.all(), 
            message='A user with this email already exists.'
        )]
    )
    
    role = serializers.ChoiceField(
        choices=['operator', 'analyst', 'admin'],
        required=False,
        error_messages={
            'invalid_choice': 'Role must be either "operator", "analyst", or "admin".',
        }
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        read_only_fields = ('id', 'role')

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def validate(self, data):
        user = self.instance
        request = self.context.get('request')
        
        if user.role != 'admin' and request and request.user.role != 'admin':
            allowed_fields = {'username', 'email'}
            provided_fields = set(data.keys())
            restricted_fields = provided_fields - allowed_fields
            
            if restricted_fields:
                raise serializers.ValidationError(
                    f"Users with '{user.role}' role can only edit username and email. "
                    f"You cannot modify: {', '.join(restricted_fields)}"
                )
        
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance