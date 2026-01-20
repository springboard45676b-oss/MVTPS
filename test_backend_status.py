#!/usr/bin/env python3
"""
Test Backend Server Status
"""

import requests
import time

def test_backend_connection():
    """Test if backend is responding"""
    try:
        print("🔍 Testing backend connection...")
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        print(f"✅ Backend responding: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend not responding - connection refused")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend timeout")
        return False
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    endpoints = [
        "/api/",
        "/api/auth/",
        "/api/vessels/",
    ]
    
    for endpoint in endpoints:
        try:
            url = f"http://127.0.0.1:8000{endpoint}"
            response = requests.get(url, timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def main():
    print("🔧 Backend Status Check")
    print("=" * 30)
    
    # Wait a bit for server to fully start
    print("⏳ Waiting for backend to fully initialize...")
    time.sleep(3)
    
    if test_backend_connection():
        test_api_endpoints()
        print("\n🎯 Backend is ready for testing!")
    else:
        print("\n⚠️ Backend not ready yet. Please wait and try again.")

if __name__ == "__main__":
    main()