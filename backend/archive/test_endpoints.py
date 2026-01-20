#!/usr/bin/env python
"""
Simple test to verify safety endpoints are accessible without authentication
"""

import requests
import json

def test_endpoints():
    base_url = "http://localhost:8000/api"
    
    endpoints = [
        "/safety/piracy/",
        "/safety/weather/", 
        "/vessels/live-positions/"
    ]
    
    print("Testing Safety Endpoints (No Auth Required):")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"+ {endpoint}: {len(data) if isinstance(data, list) else 'OK'} items")
            else:
                print(f"- {endpoint}: HTTP {response.status_code}")
        except Exception as e:
            print(f"- {endpoint}: Error - {e}")

if __name__ == "__main__":
    test_endpoints()