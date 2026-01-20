#!/usr/bin/env python3
"""
Test login credentials
"""

import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from authentication.models import User
from django.contrib.auth import authenticate

def test_django_auth():
    """Test Django authentication directly"""
    print("🔐 Testing Django Authentication")
    print("=" * 40)
    
    # Test admin credentials
    test_cases = [
        ('admin', 'admin123'),
        ('operator', 'operator123'),
        ('admin', 'admin'),  # Wrong password
    ]
    
    for username, password in test_cases:
        print(f"\n👤 Testing: {username} / {'*' * len(password)}")
        
        # Check if user exists
        try:
            user = User.objects.get(username=username)
            print(f"   ✅ User exists: {user.username}")
            print(f"   📧 Email: {user.email}")
            print(f"   🔓 Active: {user.is_active}")
        except User.DoesNotExist:
            print(f"   ❌ User does not exist")
            continue
        
        # Test authentication
        auth_user = authenticate(username=username, password=password)
        if auth_user:
            print(f"   ✅ Authentication successful")
        else:
            print(f"   ❌ Authentication failed")
            
            # Check password manually
            if user.check_password(password):
                print(f"   🔍 Password check: ✅ Correct")
            else:
                print(f"   🔍 Password check: ❌ Incorrect")

def test_api_login():
    """Test API login endpoint"""
    print("\n🌐 Testing API Login Endpoint")
    print("=" * 40)
    
    test_cases = [
        ('admin', 'admin123'),
        ('operator', 'operator123'),
    ]
    
    for username, password in test_cases:
        print(f"\n👤 API Test: {username} / {'*' * len(password)}")
        
        try:
            response = requests.post(
                'http://127.0.0.1:8000/api/auth/login/',
                json={'username': username, 'password': password},
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Login successful")
                print(f"   👤 User: {data.get('user', {}).get('username')}")
                print(f"   🎫 Token: {data.get('tokens', {}).get('access', '')[:20]}...")
            else:
                print(f"   ❌ Login failed")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                    
        except requests.exceptions.ConnectionError:
            print("   ❌ Cannot connect to Django server")
            print("   💡 Make sure Django server is running: python manage.py runserver")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def reset_admin_password():
    """Reset admin password to admin123"""
    print("\n🔧 Resetting Admin Password")
    print("=" * 30)
    
    try:
        admin_user = User.objects.get(username='admin')
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Admin password reset to 'admin123'")
        
        # Test the new password
        if admin_user.check_password('admin123'):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
            
    except User.DoesNotExist:
        print("❌ Admin user not found")

def main():
    print("🔐 Login Credentials Test")
    print("=" * 30)
    
    reset_admin_password()
    test_django_auth()
    test_api_login()
    
    print("\n" + "=" * 30)
    print("💡 Correct Credentials:")
    print("   Admin: admin / admin123")
    print("   Operator: operator / operator123")

if __name__ == "__main__":
    main()