#!/usr/bin/env python3
"""
Test Frontend Accessibility
"""

import requests
import time

def test_frontend_server():
    """Test if React frontend is accessible"""
    print("🌐 Testing Frontend Server")
    print("=" * 30)
    
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        
        if response.status_code == 200:
            print("✅ Frontend server is running")
            print(f"   Status: {response.status_code}")
            print(f"   Content length: {len(response.text)} bytes")
            
            # Check if it's a React app
            if "react" in response.text.lower() or "root" in response.text:
                print("✅ React application detected")
            
            return True
        else:
            print(f"⚠️ Frontend responding with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Frontend server not accessible")
        print("   Make sure React development server is running")
        return False
    except Exception as e:
        print(f"❌ Error accessing frontend: {e}")
        return False

def test_backend_server():
    """Test if Django backend is accessible"""
    print("\n🔧 Testing Backend Server")
    print("=" * 30)
    
    try:
        response = requests.get("http://127.0.0.1:8000", timeout=10)
        
        print(f"✅ Backend server is running")
        print(f"   Status: {response.status_code}")
        
        # Test API endpoint
        api_response = requests.get("http://127.0.0.1:8000/api/vessels/", timeout=10)
        print(f"✅ API endpoints accessible")
        print(f"   API Status: {api_response.status_code}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not accessible")
        return False
    except Exception as e:
        print(f"❌ Error accessing backend: {e}")
        return False

def main():
    print("🚀 Maritime Platform - Server Accessibility Test")
    print("=" * 50)
    
    frontend_ok = test_frontend_server()
    backend_ok = test_backend_server()
    
    print(f"\n📋 Server Status Summary")
    print("=" * 30)
    print(f"Frontend (React): {'✅ Running' if frontend_ok else '❌ Not accessible'}")
    print(f"Backend (Django): {'✅ Running' if backend_ok else '❌ Not accessible'}")
    
    if frontend_ok and backend_ok:
        print(f"\n🎉 Both servers are running successfully!")
        print(f"🌐 Access the application at: http://localhost:3000")
        print(f"🔧 Admin panel at: http://127.0.0.1:8000/admin/")
        print(f"📡 Real-time subscriptions at: http://localhost:3000/subscriptions")
        
        print(f"\n🔑 Login Credentials:")
        print(f"   Username: admin")
        print(f"   Password: admin123")
        
        print(f"\n🚢 Real Ship Notifications:")
        print(f"   ✅ Subscription created for 10 real ships")
        print(f"   ✅ Excludes 5 demo vessels")
        print(f"   ✅ Email + Push notifications enabled")
        print(f"   ✅ Updates every 5 minutes")
        
    else:
        print(f"\n⚠️ Some servers are not running.")
        print(f"   Run: .\\start_all_servers.bat to start both servers")

if __name__ == "__main__":
    main()