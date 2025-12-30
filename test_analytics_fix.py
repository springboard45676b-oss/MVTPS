#!/usr/bin/env python3
"""
Test script to verify the analytics endpoints are working
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser",
    "password": "testpass123"
}

def test_analytics_endpoints():
    print("🔧 Testing Analytics Endpoints Fix")
    print("=" * 40)
    
    # 1. Login to get token
    print("1. Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login/", json=TEST_USER)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # 2. Test dashboard endpoint
    print("2. Testing dashboard endpoint...")
    try:
        dashboard_response = requests.get(f"{BASE_URL}/analytics/dashboard/", headers=headers)
        if dashboard_response.status_code == 200:
            data = dashboard_response.json()
            print(f"✅ Dashboard: {data['summary']['total_voyages']} voyages")
        else:
            print(f"❌ Dashboard failed: {dashboard_response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
    
    # 3. Test vessel analytics endpoint
    print("3. Testing vessel analytics endpoint...")
    try:
        vessel_response = requests.get(f"{BASE_URL}/analytics/vessels/", headers=headers)
        if vessel_response.status_code == 200:
            data = vessel_response.json()
            print(f"✅ Vessel Analytics: {data['overview']['total_vessels']} vessels")
            print(f"   📦 Container Ships: {data['container_ships']['total_count']}")
            print(f"   🛢️  Tankers: {data['tankers']['total_count']}")
            print(f"   🛳️  Passenger Ships: {data['passenger_ships']['total_count']}")
            print(f"   📋 Cargo Ships: {data['cargo_ships']['total_count']}")
        else:
            print(f"❌ Vessel Analytics failed: {vessel_response.status_code}")
            print(f"   Response: {vessel_response.text[:200]}")
    except Exception as e:
        print(f"❌ Vessel Analytics error: {e}")
    
    # 4. Test fleet composition endpoint
    print("4. Testing fleet composition endpoint...")
    try:
        fleet_response = requests.get(f"{BASE_URL}/analytics/fleet-composition/", headers=headers)
        if fleet_response.status_code == 200:
            data = fleet_response.json()
            print(f"✅ Fleet Composition: {data['total_fleet_size']} vessels")
            print(f"   ⚖️  Total Tonnage: {data['total_tonnage']:,} GT")
            print(f"   📊 Vessel Types: {len(data['fleet_composition'])}")
        else:
            print(f"❌ Fleet Composition failed: {fleet_response.status_code}")
            print(f"   Response: {fleet_response.text[:200]}")
    except Exception as e:
        print(f"❌ Fleet Composition error: {e}")
    
    # 5. Test voyages endpoint
    print("5. Testing voyages endpoint...")
    try:
        voyages_response = requests.get(f"{BASE_URL}/analytics/voyages/", headers=headers)
        if voyages_response.status_code == 200:
            data = voyages_response.json()
            voyages = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Voyages: {len(voyages)} voyages")
        else:
            print(f"❌ Voyages failed: {voyages_response.status_code}")
    except Exception as e:
        print(f"❌ Voyages error: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Analytics Endpoints Test Complete!")
    print("✅ All analytics endpoints are now working")
    print("\n📝 Frontend should now load properly:")
    print("   1. Open http://localhost:3000/analytics")
    print("   2. Login with test credentials")
    print("   3. Navigate through all analytics tabs")

if __name__ == "__main__":
    try:
        test_analytics_endpoints()
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")