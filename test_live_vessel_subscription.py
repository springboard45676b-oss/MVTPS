#!/usr/bin/env python3
"""
Test script for live vessel subscription functionality
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "admin",
    "password": "admin123"
}

def test_live_vessel_subscriptions():
    print("🚢 Testing Live Vessel Subscription System")
    print("=" * 50)
    
    # 1. Login to get token
    print("1. Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login/", data=TEST_USER)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return False
    
    login_data = login_response.json()
    print(f"Login response: {login_data}")
    
    # Try different token field names
    token = login_data.get('access') or login_data.get('token') or login_data.get('access_token')
    if not token:
        print(f"❌ No token found in response: {login_data}")
        return False
        
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Login successful")
    
    # 2. Get live vessels
    print("\n2. Fetching live vessels...")
    vessels_response = requests.get(f"{BASE_URL}/vessels/live/", headers=headers)
    
    if vessels_response.status_code != 200:
        print(f"❌ Failed to fetch live vessels: {vessels_response.status_code}")
        print(f"Response: {vessels_response.text}")
        return False
    
    vessels_data = vessels_response.json()
    vessels = vessels_data.get('vessels', [])
    print(f"✅ Found {len(vessels)} live vessels")
    
    if not vessels:
        print("❌ No vessels available for testing")
        return False
    
    # 3. Test subscription to first vessel
    test_vessel = vessels[0]
    mmsi = test_vessel['mmsi']
    vessel_name = test_vessel.get('name', 'Unknown')
    
    print(f"\n3. Subscribing to vessel: {vessel_name} (MMSI: {mmsi})")
    subscribe_response = requests.post(
        f"{BASE_URL}/vessels/subscribe-live/",
        json={'mmsi': mmsi, 'vessel_name': vessel_name},
        headers=headers
    )
    
    if subscribe_response.status_code not in [200, 201]:
        print(f"❌ Subscription failed: {subscribe_response.status_code}")
        print(f"Response: {subscribe_response.text}")
        return False
    
    print("✅ Subscription successful")
    print(f"Response: {subscribe_response.json()}")
    
    # 4. Verify subscription status
    print("\n4. Verifying subscription status...")
    vessels_response = requests.get(f"{BASE_URL}/vessels/live/", headers=headers)
    updated_vessels = vessels_response.json().get('vessels', [])
    
    subscribed_vessel = next((v for v in updated_vessels if v['mmsi'] == mmsi), None)
    if subscribed_vessel and subscribed_vessel.get('is_subscribed'):
        print("✅ Subscription status verified")
    else:
        print("❌ Subscription status not updated")
        return False
    
    # 5. Get user's live subscriptions
    print("\n5. Getting user's live subscriptions...")
    subscriptions_response = requests.get(f"{BASE_URL}/vessels/live-subscriptions/", headers=headers)
    
    if subscriptions_response.status_code != 200:
        print(f"❌ Failed to get subscriptions: {subscriptions_response.status_code}")
        print(f"Response: {subscriptions_response.text}")
        return False
    
    subscriptions = subscriptions_response.json()
    print(f"✅ Found {len(subscriptions)} active subscriptions")
    
    for sub in subscriptions:
        print(f"   • {sub['vessel_name']} (MMSI: {sub['mmsi']})")
    
    # 6. Test unsubscription
    print(f"\n6. Unsubscribing from vessel: {vessel_name}")
    unsubscribe_response = requests.delete(
        f"{BASE_URL}/vessels/unsubscribe-live/",
        json={'mmsi': mmsi},
        headers=headers
    )
    
    if unsubscribe_response.status_code not in [200, 204]:
        print(f"❌ Unsubscription failed: {unsubscribe_response.status_code}")
        print(f"Response: {unsubscribe_response.text}")
        return False
    
    print("✅ Unsubscription successful")
    print(f"Response: {unsubscribe_response.json()}")
    
    # 7. Verify unsubscription
    print("\n7. Verifying unsubscription...")
    vessels_response = requests.get(f"{BASE_URL}/vessels/live/", headers=headers)
    final_vessels = vessels_response.json().get('vessels', [])
    
    unsubscribed_vessel = next((v for v in final_vessels if v['mmsi'] == mmsi), None)
    if unsubscribed_vessel and not unsubscribed_vessel.get('is_subscribed'):
        print("✅ Unsubscription verified")
    else:
        print("❌ Unsubscription not verified")
        return False
    
    print("\n🎉 All tests passed! Live vessel subscription system is working correctly.")
    return True

def main():
    try:
        success = test_live_vessel_subscriptions()
        if success:
            print("\n✅ Live vessel subscription system is ready!")
            print("\nNext steps:")
            print("1. Start the frontend development server")
            print("2. Navigate to the Vessel Tracking page")
            print("3. Switch to 'Live Data' mode")
            print("4. Click 'Subscribe' on any vessel to start live tracking")
            print("5. Watch for real-time position updates and notifications")
        else:
            print("\n❌ Tests failed. Please check the backend configuration.")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running on http://localhost:8000")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()