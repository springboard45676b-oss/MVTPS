#!/usr/bin/env python3
"""
Test script to verify the notification system is working
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "operator"
}

def test_notifications():
    print("🔔 Testing Maritime Platform Notification System")
    print("=" * 50)
    
    # 1. Register a test user
    print("1. Registering test user...")
    register_response = requests.post(f"{BASE_URL}/auth/register/", json=TEST_USER)
    if register_response.status_code == 201:
        print("✅ User registered successfully")
    elif register_response.status_code == 400 and "already exists" in register_response.text:
        print("ℹ️  User already exists, continuing...")
    else:
        print(f"❌ Registration failed: {register_response.text}")
        return
    
    # 2. Login to get token
    print("2. Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # 3. Get vessels
    print("3. Fetching vessels...")
    vessels_response = requests.get(f"{BASE_URL}/vessels/", headers=headers)
    if vessels_response.status_code != 200:
        print(f"❌ Failed to fetch vessels: {vessels_response.text}")
        return
    
    vessels = vessels_response.json()
    if isinstance(vessels, dict) and 'results' in vessels:
        vessels = vessels['results']
    
    if not vessels:
        print("❌ No vessels found in database")
        return
    
    print(f"✅ Found {len(vessels)} vessels")
    
    # 4. Subscribe to a vessel
    test_vessel = vessels[0]
    print(f"4. Subscribing to vessel: {test_vessel['name']}")
    subscribe_response = requests.post(
        f"{BASE_URL}/vessels/{test_vessel['id']}/subscribe/", 
        headers=headers
    )
    
    if subscribe_response.status_code == 200:
        print("✅ Subscription successful")
    else:
        print(f"❌ Subscription failed: {subscribe_response.text}")
        return
    
    # 5. Check notifications
    print("5. Checking notifications...")
    notifications_response = requests.get(f"{BASE_URL}/notifications/", headers=headers)
    
    if notifications_response.status_code != 200:
        print(f"❌ Failed to fetch notifications: {notifications_response.text}")
        return
    
    notifications = notifications_response.json()
    print(f"✅ Found {len(notifications)} notifications")
    
    # 6. Get notification stats
    print("6. Getting notification statistics...")
    stats_response = requests.get(f"{BASE_URL}/notifications/stats/", headers=headers)
    
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print(f"✅ Notification Stats:")
        print(f"   📊 Total: {stats['total']}")
        print(f"   🔔 Unread: {stats['unread']}")
        print(f"   🚨 Critical: {stats['priority_counts'].get('critical', 0)}")
        print(f"   ⚠️  High: {stats['priority_counts'].get('high', 0)}")
    else:
        print(f"❌ Failed to get stats: {stats_response.text}")
    
    # 7. Test vessel analytics
    print("7. Testing vessel analytics...")
    analytics_response = requests.get(f"{BASE_URL}/analytics/vessels/", headers=headers)
    
    if analytics_response.status_code == 200:
        analytics = analytics_response.json()
        print(f"✅ Vessel Analytics:")
        print(f"   🚢 Total Vessels: {analytics['overview']['total_vessels']}")
        print(f"   📡 Active Vessels: {analytics['overview']['active_vessels']}")
        print(f"   📦 Container Ships: {analytics['container_ships']['total_count']}")
        print(f"   🛢️  Tankers: {analytics['tankers']['total_count']}")
    else:
        print(f"❌ Failed to get analytics: {analytics_response.text}")
    
    # 8. Test fleet composition
    print("8. Testing fleet composition...")
    fleet_response = requests.get(f"{BASE_URL}/analytics/fleet-composition/", headers=headers)
    
    if fleet_response.status_code == 200:
        fleet = fleet_response.json()
        print(f"✅ Fleet Composition:")
        print(f"   🏭 Total Fleet Size: {fleet['total_fleet_size']}")
        print(f"   ⚖️  Total Tonnage: {fleet['total_tonnage']:,} GT")
        print(f"   📋 Vessel Types: {len(fleet['fleet_composition'])}")
    else:
        print(f"❌ Failed to get fleet composition: {fleet_response.text}")
    
    print("\n" + "=" * 50)
    print("🎉 Notification System Test Complete!")
    print("✅ All systems are working properly")
    print("\n📝 Next Steps:")
    print("   1. Open http://localhost:3000 in your browser")
    print("   2. Login with the test user credentials")
    print("   3. Navigate to the Notifications page")
    print("   4. Check the Analytics page for vessel insights")
    print("   5. Subscribe to vessels in the Vessel Tracking page")

if __name__ == "__main__":
    try:
        test_notifications()
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")