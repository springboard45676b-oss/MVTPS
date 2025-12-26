# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from accounts.models import UserProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=['operator', 'analyst', 'admin'], required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role', 'operator')
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Create or update user profile with role
        UserProfile.objects.update_or_create(
            user=user,
            defaults={'role': role}
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')




from django.contrib.auth.models import User
from rest_framework import serializers

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']


        