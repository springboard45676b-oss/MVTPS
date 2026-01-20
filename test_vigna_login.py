#!/usr/bin/env python3
"""
Test vigna account login specifically
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

def test_vigna_account():
    print('🧪 Testing vigna account')
    print('=' * 30)

    try:
        user = User.objects.get(username='vigna')
        print(f'✅ User exists: {user.username}')
        print(f'📧 Email: {user.email}')
        print(f'🔓 Active: {user.is_active}')
        
        # Reset password to be sure
        user.set_password('vigna123')
        user.save()
        print('🔧 Password set to: vigna123')
        
        # Test password
        if user.check_password('vigna123'):
            print('✅ Password vigna123 is correct')
        else:
            print('❌ Password vigna123 is incorrect')
        
        # Test Django authentication
        auth_user = authenticate(username='vigna', password='vigna123')
        if auth_user:
            print('✅ Django authentication successful')
        else:
            print('❌ Django authentication failed')
        
        # Test API login
        print('\n🌐 Testing API login for vigna...')
        try:
            response = requests.post(
                'http://127.0.0.1:8000/api/auth/login/',
                json={'username': 'vigna', 'password': 'vigna123'},
                headers={'Content-Type': 'application/json'}
            )
            print(f'Status Code: {response.status_code}')
            if response.status_code == 200:
                data = response.json()
                print('✅ API login successful')
                print(f'User: {data.get("user", {}).get("username")}')
                print(f'Token: {data.get("tokens", {}).get("access", "")[:20]}...')
            else:
                print('❌ API login failed')
                print(f'Error: {response.text}')
        except requests.exceptions.ConnectionError:
            print('❌ Cannot connect to Django server')
            print('💡 Make sure Django server is running: python manage.py runserver')
        
    except User.DoesNotExist:
        print('❌ User vigna not found')

def check_server_status():
    print('\n🔍 Checking Django Server Status')
    print('=' * 35)
    
    try:
        response = requests.get('http://127.0.0.1:8000/api/auth/login/', timeout=5)
        print('✅ Django server is running')
        print(f'Response status: {response.status_code}')
    except requests.exceptions.ConnectionError:
        print('❌ Django server is NOT running')
        print('💡 Start it with: python manage.py runserver')
    except Exception as e:
        print(f'⚠️ Server check error: {e}')

if __name__ == "__main__":
    check_server_status()
    test_vigna_account()
    
    print('\n' + '=' * 40)
    print('🔑 Login Credentials for vigna:')
    print('   Username: vigna')
    print('   Password: vigna123')
    print('\n💡 Alternative working accounts:')
    print('   Username: admin, Password: admin123')
    print('   Username: operator, Password: operator123')