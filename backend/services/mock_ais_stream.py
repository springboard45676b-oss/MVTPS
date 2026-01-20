import json
import time
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def generate_mock_vessel():
    """Generate mock vessel data for testing"""
    mmsi = random.randint(367000000, 367999999)
    return {
        "mmsi": str(mmsi),
        "latitude": 33.7 + (random.random() - 0.5) * 0.1,
        "longitude": -118.2 + (random.random() - 0.5) * 0.1,
        "speed": random.randint(0, 25),
        "course": random.randint(0, 359),
        "heading": random.randint(0, 359),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "vessel_name": f"Test Vessel {mmsi % 1000}",
        "vessel_type": random.choice(["Cargo", "Tanker", "Container", "Passenger"])
    }

def start_mock_ais_stream():
    """Start mock AIS stream for testing"""
    print("Starting Mock AIS Stream...")
    channel_layer = get_channel_layer()
    
    try:
        while True:
            # Generate 5 mock vessels
            for _ in range(5):
                vessel_data = generate_mock_vessel()
                
                async_to_sync(channel_layer.group_send)(
                    "ais_live",
                    {
                        "type": "send_ais",
                        "data": vessel_data
                    }
                )
                print(f"Sent mock data for vessel {vessel_data['mmsi']}")
            
            time.sleep(5)  # Send updates every 5 seconds
            
    except KeyboardInterrupt:
        print("Mock AIS stream stopped")