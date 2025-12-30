#!/usr/bin/env python3
"""
Complete test of all analytics endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"
TEST_USER = {"username": "testuser", "password": "testpass123"}

def test_all_analytics():
    print("🔍 Complete Analytics Test")
    print("=" * 50)
    
    # Login
    login_response = requests.post(f"{BASE_URL}/auth/login/", json=TEST_USER)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test all endpoints
    endpoints = [
        ("/analytics/dashboard/", "Dashboard"),
        ("/analytics/vessels/", "Vessel Analytics"),
        ("/analytics/fleet-composition/", "Fleet Composition"),
        ("/analytics/voyages/", "Voyages"),
        ("/notifications/", "Notifications"),
        ("/notifications/stats/", "Notification Stats"),
    ]
    
    results = {}
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                results[name] = "✅ SUCCESS"
                
                # Print specific data for each endpoint
                if name == "Dashboard":
                    print(f"✅ {name}: {data['summary']['total_voyages']} voyages")
                elif name == "Vessel Analytics":
                    print(f"✅ {name}: {data['overview']['total_vessels']} vessels")
                elif name == "Fleet Composition":
                    print(f"✅ {name}: {data['total_fleet_size']} vessels, {len(data['fleet_composition'])} types")
                elif name == "Voyages":
                    voyages = data if isinstance(data, list) else data.get('results', [])
                    print(f"✅ {name}: {len(voyages)} voyages")
                elif name == "Notifications":
                    notifications = data if isinstance(data, list) else data.get('results', [])
                    print(f"✅ {name}: {len(notifications)} notifications")
                elif name == "Notification Stats":
                    print(f"✅ {name}: {data['total']} total, {data['unread']} unread")
                    
            else:
                results[name] = f"❌ ERROR {response.status_code}"
                print(f"❌ {name}: HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except Exception as e:
            results[name] = f"❌ EXCEPTION: {str(e)}"
            print(f"❌ {name}: Exception - {e}")
    
    print("\n" + "=" * 50)
    print("📊 FINAL RESULTS:")
    for name, result in results.items():
        print(f"   {name}: {result}")
    
    # Check if all are successful
    all_success = all("✅" in result for result in results.values())
    
    if all_success:
        print("\n🎉 ALL ANALYTICS ENDPOINTS WORKING!")
        print("✅ Frontend should now load properly")
        print("📱 Try refreshing http://localhost:3000/analytics")
    else:
        print("\n⚠️  Some endpoints have issues")
        print("🔧 Check the failed endpoints above")

if __name__ == "__main__":
    try:
        test_all_analytics()
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server not running")
    except Exception as e:
        print(f"❌ Test failed: {e}")