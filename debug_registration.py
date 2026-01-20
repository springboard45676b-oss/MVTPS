#!/usr/bin/env python3
"""
Debug registration issues
"""

import os
import sys
import django
import json

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from authentication.models import User
from authentication.serializers import UserRegistrationSerializer

def test_serializer_validation():
    """Test the serializer validation directly"""
    print("🧪 Testing Registration Serializer")
    print("=" * 40)
    
    # Test data similar to what the frontend sends
    test_data = {
        'username': 'aishu_test',
        'email': 'aishu_test@gmail.com',
        'password': 'password123',
        'password_confirm': 'password123',
        'first_name': 'Aishu',
        'last_name': 'Test',
        'role': 'operator',
        'company': 'Test Company',
        'phone': '+919988439862'
    }
    
    print("📝 Test Data:")
    for key, value in test_data.items():
        if 'password' in key:
            print(f"   {key}: {'*' * len(value)}")
        else:
            print(f"   {key}: {value}")
    
    # Test serializer
    serializer = UserRegistrationSerializer(data=test_data)
    
    print(f"\n🔍 Serializer Validation:")
    if serializer.is_valid():
        print("✅ Serializer validation passed!")
        
        # Try to create user
        try:
            user = serializer.save()
            print(f"✅ User created successfully: {user.username}")
            
            # Clean up - delete the test user
            user.delete()
            print("🧹 Test user cleaned up")
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
    else:
        print("❌ Serializer validation failed!")
        print("🔍 Validation errors:")
        for field, errors in serializer.errors.items():
            print(f"   {field}: {errors}")

def check_existing_users():
    """Check if username/email already exists"""
    print("\n👥 Checking Existing Users")
    print("=" * 30)
    
    test_usernames = ['aishu', 'aishu_test', 'testuser']
    test_emails = ['aishu@gmail.com', 'aishu_test@gmail.com', 'test@example.com']
    
    for username in test_usernames:
        exists = User.objects.filter(username=username).exists()
        print(f"   Username '{username}': {'❌ EXISTS' if exists else '✅ Available'}")
    
    for email in test_emails:
        exists = User.objects.filter(email=email).exists()
        print(f"   Email '{email}': {'❌ EXISTS' if exists else '✅ Available'}")

def test_password_validation():
    """Test password validation"""
    print("\n🔐 Testing Password Validation")
    print("=" * 35)
    
    test_cases = [
        ('password123', 'password123', True),
        ('password123', 'different123', False),
        ('short', 'short', False),  # Too short
        ('', '', False),  # Empty
    ]
    
    for password, confirm, should_pass in test_cases:
        test_data = {
            'username': 'testuser_pwd',
            'email': 'testpwd@example.com',
            'password': password,
            'password_confirm': confirm,
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'operator'
        }
        
        serializer = UserRegistrationSerializer(data=test_data)
        is_valid = serializer.is_valid()
        
        status = "✅ PASS" if is_valid == should_pass else "❌ FAIL"
        print(f"   Password: {'*' * len(password)}, Confirm: {'*' * len(confirm)} - {status}")
        
        if not is_valid and serializer.errors:
            for field, errors in serializer.errors.items():
                print(f"      Error in {field}: {errors}")

def check_database_connection():
    """Check if database is accessible"""
    print("\n🗄️  Testing Database Connection")
    print("=" * 35)
    
    try:
        user_count = User.objects.count()
        print(f"✅ Database accessible - {user_count} users found")
        
        # Test creating a simple user
        test_user = User(
            username='db_test_user',
            email='dbtest@example.com',
            first_name='DB',
            last_name='Test'
        )
        test_user.set_password('testpass123')
        
        # Don't save, just validate
        test_user.full_clean()
        print("✅ User model validation passed")
        
    except Exception as e:
        print(f"❌ Database error: {e}")

def main():
    print("🔧 Maritime Platform Registration Debug")
    print("=" * 45)
    
    check_database_connection()
    check_existing_users()
    test_password_validation()
    test_serializer_validation()
    
    print("\n" + "=" * 45)
    print("🎯 Summary:")
    print("1. Check if username 'aishu' already exists")
    print("2. Verify password requirements (min 8 chars)")
    print("3. Ensure passwords match")
    print("4. Check database connectivity")
    print("\n💡 If issues persist, check Django server logs for detailed errors")

if __name__ == "__main__":
    main()