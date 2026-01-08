#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints
Run this after starting the backend server
"""

import requests
import json

BACKEND_URL = "http://localhost:8000"

def test_registration():
    """Test user registration"""
    print("🔐 Testing Registration...")
    
    registration_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "role": "Operator"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/register/", json=registration_data)
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Registration successful!")
            print(f"   User: {data['user']['username']}")
            print(f"   Role: {data['user']['role']}")
            print(f"   Token: {data['access'][:20]}...")
            return data['access']
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

def test_login():
    """Test user login"""
    print("\n🔑 Testing Login...")
    
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/login/", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   User: {data['user']['username']}")
            print(f"   Role: {data['user']['role']}")
            print(f"   Token: {data['access'][:20]}...")
            return data['access']
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_endpoint(token):
    """Test accessing a protected endpoint"""
    print("\n🛡️ Testing Protected Endpoint...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/vessels/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Protected endpoint accessible!")
            print(f"   Found {len(data.get('results', []))} vessels")
        else:
            print(f"❌ Protected endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")

def main():
    print("🧪 Authentication Test Suite")
    print("=" * 40)
    print("📋 Prerequisites:")
    print("1. Backend server running on http://localhost:8000")
    print("2. Database migrations applied")
    print()
    
    # Test registration
    token = test_registration()
    
    if token:
        # Test protected endpoint with registration token
        test_protected_endpoint(token)
    
    # Test login
    login_token = test_login()
    
    if login_token:
        # Test protected endpoint with login token
        test_protected_endpoint(login_token)
    
    print("\n🎯 Test completed!")
    print("If you see '✅ Registration successful!' and '✅ Login successful!' then auth is working.")

if __name__ == "__main__":
    main()
