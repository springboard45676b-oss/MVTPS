#!/usr/bin/env python3
"""
Test registration with unique credentials
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

def test_registration_api():
    """Test registration via API endpoint"""
    print("🧪 Testing Registration API")
    print("=" * 40)
    
    # Test with unique credentials
    test_data = {
        'username': 'aishu_new',
        'email': 'aishu_new@gmail.com',
        'password': 'password123',
        'password_confirm': 'password123',
        'first_name': 'Aishu',
        'last_name': 'New',
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
    
    try:
        # Make API request to registration endpoint
        response = requests.post(
            'http://127.0.0.1:8000/api/auth/register/',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n🌐 API Response:")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            response_data = response.json()
            print(f"   Message: {response_data.get('message', 'No message')}")
            if 'user' in response_data:
                user_data = response_data['user']
                print(f"   Created User: {user_data.get('username')} ({user_data.get('email')})")
            
            # Clean up - delete the test user
            try:
                user = User.objects.get(username='aishu_new')
                user.delete()
                print("🧹 Test user cleaned up")
            except User.DoesNotExist:
                pass
                
        else:
            print("❌ Registration failed!")
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Error: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server")
        print("💡 Make sure Django server is running: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {e}")

def show_existing_conflict():
    """Show the conflicting user"""
    print("\n🔍 Existing User Conflict")
    print("=" * 30)
    
    try:
        user = User.objects.get(username='aishu')
        print(f"   Username 'aishu' exists:")
        print(f"   - Email: {user.email}")
        print(f"   - Full Name: {user.first_name} {user.last_name}")
        print(f"   - Joined: {user.date_joined}")
        print(f"   - ID: {user.id}")
    except User.DoesNotExist:
        print("   Username 'aishu' not found")

def suggest_solutions():
    """Suggest solutions for the user"""
    print("\n💡 Solutions for Registration Issue")
    print("=" * 40)
    
    print("The registration is failing because:")
    print("1. ❌ Username 'aishu' already exists")
    print("2. ❌ Email 'aishu@gmail.com' already exists")
    print()
    print("To fix this, try registering with:")
    print("✅ Different username (e.g., 'aishu2', 'aishu_new', 'aishu2025')")
    print("✅ Different email (e.g., 'aishu2@gmail.com', 'aishu.new@gmail.com')")
    print()
    print("Example working credentials:")
    print("   Username: aishu_new")
    print("   Email: aishu_new@gmail.com")
    print("   Password: password123 (min 8 characters)")
    print("   Password Confirm: password123 (must match)")

def main():
    print("🔧 Registration Issue Fix Test")
    print("=" * 35)
    
    show_existing_conflict()
    suggest_solutions()
    test_registration_api()
    
    print("\n" + "=" * 35)
    print("🎯 Next Steps:")
    print("1. Use unique username and email in frontend form")
    print("2. Ensure passwords match and are 8+ characters")
    print("3. Check Django server is running on http://127.0.0.1:8000/")

if __name__ == "__main__":
    main()