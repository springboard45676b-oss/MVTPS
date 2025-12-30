#!/usr/bin/env python3
"""
Check the complete system status
"""

import requests
import subprocess
import time

def check_backend():
    try:
        response = requests.get('http://localhost:8000/api/auth/login/', timeout=5)
        return response.status_code in [200, 405]  # 405 is expected for GET on login endpoint
    except:
        return False

def check_frontend():
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    print("🔍 Maritime Platform System Status Check")
    print("=" * 50)
    
    # Check backend
    print("1. Checking Backend Server (Django)...")
    if check_backend():
        print("   ✅ Backend is running on http://localhost:8000")
    else:
        print("   ❌ Backend is not responding")
        print("   💡 Start with: cd backend && python manage.py runserver")
        return
    
    # Check frontend
    print("2. Checking Frontend Server (React)...")
    if check_frontend():
        print("   ✅ Frontend is running on http://localhost:3000")
    else:
        print("   ❌ Frontend is not responding")
        print("   💡 Start with: cd frontend && npm start")
        return
    
    # Test API endpoints
    print("3. Testing API Authentication...")
    try:
        login_response = requests.post('http://localhost:8000/api/auth/login/', 
                                     json={'username': 'testuser', 'password': 'testpass123'})
        if login_response.status_code == 200:
            print("   ✅ Authentication working")
            token = login_response.json()['tokens']['access']
            
            # Test analytics endpoints
            print("4. Testing Analytics Endpoints...")
            headers = {'Authorization': f'Bearer {token}'}
            
            endpoints = [
                '/analytics/dashboard/',
                '/analytics/vessels/',
                '/analytics/fleet-composition/',
                '/analytics/voyages/',
                '/notifications/'
            ]
            
            all_working = True
            for endpoint in endpoints:
                try:
                    response = requests.get(f'http://localhost:8000/api{endpoint}', headers=headers)
                    if response.status_code == 200:
                        print(f"   ✅ {endpoint}")
                    else:
                        print(f"   ❌ {endpoint} - HTTP {response.status_code}")
                        all_working = False
                except Exception as e:
                    print(f"   ❌ {endpoint} - {str(e)}")
                    all_working = False
            
            if all_working:
                print("\n🎉 ALL SYSTEMS OPERATIONAL!")
                print("✅ Backend: Running")
                print("✅ Frontend: Running") 
                print("✅ Authentication: Working")
                print("✅ Analytics APIs: Working")
                print("✅ Notifications: Working")
                print("\n📱 You can now use the application:")
                print("   🌐 Frontend: http://localhost:3000")
                print("   🔧 API Test: http://localhost:3000/analytics")
                print("   👤 Login: testuser / testpass123")
            else:
                print("\n⚠️  Some API endpoints have issues")
                
        else:
            print("   ❌ Authentication failed")
            print(f"   Response: {login_response.text}")
            
    except Exception as e:
        print(f"   ❌ API test failed: {e}")

if __name__ == "__main__":
    main()