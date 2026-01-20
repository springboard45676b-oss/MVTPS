#!/usr/bin/env python3
"""
Test script to verify both Django backend and React frontend servers are running
"""

import requests
import time
import sys
from urllib.parse import urljoin

def test_backend():
    """Test if Django backend is running"""
    try:
        print("🔍 Testing Django Backend...")
        response = requests.get('http://127.0.0.1:8000/api/', timeout=10)
        if response.status_code in [200, 404]:  # 404 is OK, means server is running
            print("✅ Django Backend: RUNNING on http://127.0.0.1:8000")
            return True
        else:
            print(f"⚠️  Django Backend: Unexpected status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Django Backend: NOT RUNNING")
        return False
    except Exception as e:
        print(f"❌ Django Backend: ERROR - {e}")
        return False

def test_frontend():
    """Test if React frontend is running"""
    try:
        print("🔍 Testing React Frontend...")
        response = requests.get('http://localhost:3000', timeout=10)
        if response.status_code == 200:
            print("✅ React Frontend: RUNNING on http://localhost:3000")
            return True
        else:
            print(f"⚠️  React Frontend: Unexpected status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ React Frontend: NOT RUNNING (may still be starting...)")
        return False
    except Exception as e:
        print(f"❌ React Frontend: ERROR - {e}")
        return False

def main():
    print("🚢 Maritime Platform - Server Status Check")
    print("=" * 50)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n📊 Summary:")
    print("-" * 30)
    
    if backend_ok and frontend_ok:
        print("🎉 Both servers are RUNNING!")
        print("🌐 Frontend: http://localhost:3000")
        print("🔧 Backend:  http://127.0.0.1:8000")
        print("\n🔑 Login Credentials:")
        print("   • admin / admin123")
        print("   • operator / operator123")
        print("   • vigna / vigna123")
        print("\n✨ New Horizontal Bar Layout is ready to test!")
        return 0
    elif backend_ok:
        print("⚠️  Backend is running, but frontend may still be starting...")
        print("   Wait a moment and try accessing http://localhost:3000")
        return 1
    elif frontend_ok:
        print("⚠️  Frontend is running, but backend is not accessible")
        return 1
    else:
        print("❌ Neither server is accessible")
        print("   Please check the server startup processes")
        return 1

if __name__ == "__main__":
    sys.exit(main())