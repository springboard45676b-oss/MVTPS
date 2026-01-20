#!/usr/bin/env python3
"""
Test registration API to debug issues
"""

import requests
import json

def test_registration():
    """Test the registration endpoint"""
    
    # Registration data from the form
    registration_data = {
        "username": "aishu",
        "email": "aishu@gmail.com", 
        "first_name": "Aishu",
        "last_name": "Test",
        "company": "Your company name",
        "phone": "+919988439862",
        "role": "operator",
        "password": "password123",
        "password_confirm": "password123"
    }
    
    print("🧪 Testing Registration API")
    print("=" * 40)
    print(f"📝 Registration Data:")
    for key, value in registration_data.items():
        if 'password' in key:
            print(f"   {key}: {'*' * len(value)}")
        else:
            print(f"   {key}: {value}")
    
    print(f"\n🌐 Sending request to: http://127.0.0.1:8000/api/auth/register/")
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📄 Response Data:")
            print(json.dumps(response_data, indent=2))
        except:
            print(f"📄 Response Text: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ Registration successful!")
        else:
            print(f"\n❌ Registration failed with status {response.status_code}")
            
            if response.status_code == 400:
                print("🔍 This is a validation error. Check the response data above for details.")
            elif response.status_code == 500:
                print("🔍 This is a server error. Check the Django server logs.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed! Make sure Django server is running on http://127.0.0.1:8000/")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_existing_user():
    """Test registration with existing username"""
    
    existing_data = {
        "username": "vinuthna",  # This user already exists
        "email": "test2@gmail.com",
        "first_name": "Test",
        "last_name": "User",
        "company": "Test Company",
        "phone": "+919988439863",
        "role": "operator", 
        "password": "password123",
        "password_confirm": "password123"
    }
    
    print("\n🧪 Testing Registration with Existing Username")
    print("=" * 50)
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/auth/register/",
            json=existing_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 400:
            response_data = response.json()
            print("✅ Correctly rejected duplicate username:")
            print(json.dumps(response_data, indent=2))
        else:
            print("⚠️  Unexpected response for duplicate username")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_password_mismatch():
    """Test registration with password mismatch"""
    
    mismatch_data = {
        "username": "testuser123",
        "email": "testuser123@gmail.com",
        "first_name": "Test",
        "last_name": "User",
        "company": "Test Company",
        "phone": "+919988439864",
        "role": "operator",
        "password": "password123",
        "password_confirm": "differentpassword"  # Intentional mismatch
    }
    
    print("\n🧪 Testing Registration with Password Mismatch")
    print("=" * 48)
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/auth/register/",
            json=mismatch_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 400:
            response_data = response.json()
            print("✅ Correctly rejected password mismatch:")
            print(json.dumps(response_data, indent=2))
        else:
            print("⚠️  Unexpected response for password mismatch")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_registration()
    test_existing_user()
    test_password_mismatch()
    
    print("\n" + "=" * 50)
    print("🔧 Troubleshooting Tips:")
    print("1. Make sure Django server is running: python manage.py runserver")
    print("2. Check Django server console for error messages")
    print("3. Verify database is accessible")
    print("4. Check if username/email already exists")
    print("5. Ensure all required fields are provided")