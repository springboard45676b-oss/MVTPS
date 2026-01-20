#!/usr/bin/env python3
"""
Simulate live data movement for real vessels
Since the API key is invalid, this creates realistic movement for the real ships
"""

import os
import sys
import django
import random
import time
from datetime import datetime, timedelta

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition
from django.utils import timezone

def simulate_vessel_movement(vessel, hours_to_simulate=24):
    """Simulate realistic vessel movement over time"""
    print(f"🚢 Simulating movement for {vessel.name}...")
    
    # Get the last known position
    last_position = vessel.positions.first()
    if not last_position:
        print(f"   ❌ No previous position found for {vessel.name}")
        return
    
    current_lat = float(last_position.latitude)
    current_lon = float(last_position.longitude)
    current_time = timezone.now() - timedelta(hours=hours_to_simulate)
    
    # Simulate movement every hour
    positions_created = 0
    
    for hour in range(hours_to_simulate):
        # Realistic movement based on vessel type
        if vessel.vessel_type == 'container':
            speed = random.uniform(15, 25)  # Container ships are fast
            course_change = random.uniform(-5, 5)  # Small course changes
        elif vessel.vessel_type == 'tanker':
            speed = random.uniform(12, 18)  # Tankers are slower
            course_change = random.uniform(-3, 3)
        else:
            speed = random.uniform(10, 20)  # General cargo
            course_change = random.uniform(-10, 10)
        
        # Calculate new position (simplified)
        # Move roughly in the same direction with small variations
        lat_change = random.uniform(-0.1, 0.1) + (course_change * 0.01)
        lon_change = random.uniform(-0.1, 0.1) + (course_change * 0.01)
        
        current_lat += lat_change
        current_lon += lon_change
        
        # Keep within reasonable bounds
        current_lat = max(-85, min(85, current_lat))
        current_lon = max(-180, min(180, current_lon))
        
        # Create position record
        position_time = current_time + timedelta(hours=hour)
        
        VesselPosition.objects.create(
            vessel=vessel,
            latitude=current_lat,
            longitude=current_lon,
            speed=speed,
            course=random.uniform(0, 360),
            heading=random.uniform(0, 360),
            status=random.choice(['Under way using engine', 'At anchor', 'Moored']),
            timestamp=position_time
        )
        
        positions_created += 1
    
    print(f"   ✅ Created {positions_created} position records")

def simulate_all_vessels():
    """Simulate movement for all real vessels"""
    print("🌊 Simulating Live Vessel Movement")
    print("=" * 35)
    
    vessels = Vessel.objects.all()
    print(f"Found {vessels.count()} vessels to simulate")
    
    for vessel in vessels:
        simulate_vessel_movement(vessel, hours_to_simulate=48)  # 48 hours of data
    
    print(f"\n✅ Simulation complete!")
    print(f"📊 Summary:")
    print(f"   Vessels: {vessels.count()}")
    print(f"   New positions: {vessels.count() * 48}")
    print(f"   Time range: Last 48 hours")

def create_recent_positions():
    """Create very recent positions (last few hours) for immediate testing"""
    print("⚡ Creating Recent Position Updates")
    print("=" * 33)
    
    vessels = Vessel.objects.all()
    
    for vessel in vessels:
        last_position = vessel.positions.first()
        if not last_position:
            continue
        
        # Create positions for the last 3 hours
        for i in range(3):
            time_ago = timezone.now() - timedelta(hours=i)
            
            # Small random movement
            lat_change = random.uniform(-0.01, 0.01)
            lon_change = random.uniform(-0.01, 0.01)
            
            new_lat = float(last_position.latitude) + lat_change
            new_lon = float(last_position.longitude) + lon_change
            
            VesselPosition.objects.create(
                vessel=vessel,
                latitude=new_lat,
                longitude=new_lon,
                speed=random.uniform(10, 20),
                course=random.uniform(0, 360),
                heading=random.uniform(0, 360),
                status='Under way using engine',
                timestamp=time_ago
            )
    
    print(f"✅ Created recent positions for {vessels.count()} vessels")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Simulate live vessel data')
    parser.add_argument('--full', action='store_true', help='Full 48-hour simulation')
    parser.add_argument('--recent', action='store_true', help='Create recent positions only')
    
    args = parser.parse_args()
    
    if args.full:
        simulate_all_vessels()
    elif args.recent:
        create_recent_positions()
    else:
        print("🚢 Vessel Data Simulator")
        print("=" * 25)
        print("\nOptions:")
        print("  --full     Full 48-hour movement simulation")
        print("  --recent   Create recent positions (last 3 hours)")
        print("\nExample: python simulate_live_data.py --recent")

if __name__ == "__main__":
    main()