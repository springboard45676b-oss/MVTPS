#!/usr/bin/env python3
"""
Debug Authentication
"""

import requests
import json

def debug_login():
    """Debug login process"""
    print("🔍 Debugging Authentication")
    print("=" * 30)
    
    login_data = {"username": "admin", "password": "admin123"}
    
    try:
        response = requests.post("http://127.0.0.1:8000/api/auth/login/", json=login_data, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response JSON: {json.dumps(data, indent=2)}")
            
            # Check for different token field names
            token = None
            
            # Check nested tokens structure
            if 'tokens' in data and 'access' in data['tokens']:
                token = data['tokens']['access']
                print(f"Found token in 'tokens.access': {token[:20]}...")
            elif 'access' in data:
                token = data['access']
                print(f"Found token in 'access': {token[:20]}...")
            elif 'token' in data:
                token = data['token']
                print(f"Found token in 'token': {token[:20]}...")
            
            if not token:
                print("❌ No token found in response")
                print(f"Available fields: {list(data.keys())}")
            
            return token
        else:
            print(f"❌ Login failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_token_usage(token):
    """Test using the token"""
    if not token:
        print("❌ No token to test")
        return
    
    print(f"\n🔑 Testing token usage...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/vessels/", headers=headers, timeout=10)
        print(f"Vessels API Status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Token authentication failed")
        elif response.status_code == 200:
            print("✅ Token authentication successful")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing token: {e}")

def main():
    token = debug_login()
    test_token_usage(token)

if __name__ == "__main__":
    main()