#!/usr/bin/env python3
"""
Comprehensive script to manage real ship data and voyages
"""

import os
import sys
import django
import asyncio
from datetime import datetime, timedelta

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition, Voyage
from vessels.aisstream_service import aisstream_service
from vessels.voyage_tracker import voyage_tracker
from django.utils import timezone

def clear_demo_data():
    """Remove demo vessels and their data"""
    print("🧹 Clearing demo data...")
    
    demo_mmsis = ['636019825', '353136000', '477995300', '311000274', '636017894']
    demo_vessels = Vessel.objects.filter(mmsi__in=demo_mmsis)
    
    demo_count = demo_vessels.count()
    if demo_count > 0:
        # Delete positions and voyages first
        VesselPosition.objects.filter(vessel__in=demo_vessels).delete()
        Voyage.objects.filter(vessel__in=demo_vessels).delete()
        
        # Delete vessels
        demo_vessels.delete()
        
        print(f"✅ Removed {demo_count} demo vessels and their data")
    else:
        print("ℹ️  No demo data found")

def show_data_status():
    """Show current data status"""
    print("\n📊 Current Data Status")
    print("=" * 30)
    
    vessels = Vessel.objects.all()
    positions = VesselPosition.objects.all()
    voyages = Voyage.objects.all()
    
    print(f"🚢 Total vessels: {vessels.count()}")
    print(f"📍 Total positions: {positions.count()}")
    print(f"🛣️  Total voyages: {voyages.count()}")
    
    # Recent activity
    recent_positions = positions.filter(
        timestamp__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    print(f"⚡ Positions in last hour: {recent_positions}")
    
    # Demo vs Real breakdown
    demo_mmsis = ['636019825', '353136000', '477995300', '311000274', '636017894']
    demo_vessels = vessels.filter(mmsi__in=demo_mmsis)
    real_vessels = vessels.exclude(mmsi__in=demo_mmsis)
    
    print(f"\n🎭 Demo vessels: {demo_vessels.count()}")
    print(f"🌍 Real vessels: {real_vessels.count()}")
    
    if real_vessels.exists():
        print("\n🌍 Real vessels in database:")
        for vessel in real_vessels[:10]:  # Show first 10
            latest_pos = vessel.positions.first()
            if latest_pos:
                age = timezone.now() - latest_pos.timestamp
                print(f"   • {vessel.name} ({vessel.mmsi}) - {age.total_seconds()/3600:.1f}h ago")
    
    # Streaming status
    print(f"\n📡 AIS Streaming: {'Active' if aisstream_service.is_streaming() else 'Inactive'}")
    print(f"💾 Cached vessels: {len(aisstream_service.get_cached_vessels())}")

def start_real_data_collection():
    """Start collecting real AIS data"""
    print("\n🚀 Starting Real Data Collection")
    print("=" * 35)
    
    if aisstream_service.is_streaming():
        print("⚠️  AIS streaming is already active")
        return
    
    print("🌐 Starting AIS Stream connection...")
    
    # Start with global coverage first
    aisstream_service.start_streaming()
    
    print("✅ AIS streaming started!")
    print("📡 Now collecting real ship data from around the world")
    print("⏳ Data will appear in the database within a few minutes")
    print("\n💡 You can monitor progress with: python manage_real_data.py --status")

def stop_data_collection():
    """Stop AIS data collection"""
    print("\n🛑 Stopping Data Collection")
    print("=" * 28)
    
    if not aisstream_service.is_streaming():
        print("ℹ️  AIS streaming is not active")
        return
    
    aisstream_service.stop_streaming()
    print("✅ AIS streaming stopped")

def process_voyages():
    """Process voyages for all vessels"""
    print("\n🛣️  Processing Voyages")
    print("=" * 22)
    
    vessels = Vessel.objects.all()
    total_voyages = 0
    
    print(f"Processing {vessels.count()} vessels...")
    
    for i, vessel in enumerate(vessels, 1):
        print(f"[{i}/{vessels.count()}] Processing {vessel.name}...")
        
        voyages = voyage_tracker.process_vessel_positions(vessel)
        total_voyages += len(voyages)
        
        if voyages:
            print(f"   ✅ Created {len(voyages)} voyages")
    
    print(f"\n📊 Summary:")
    print(f"   Total voyages created: {total_voyages}")
    print(f"   Vessels processed: {vessels.count()}")

def show_voyage_statistics():
    """Show voyage statistics"""
    print("\n📈 Voyage Statistics")
    print("=" * 20)
    
    stats = voyage_tracker.get_voyage_statistics()
    
    print(f"🛣️  Total voyages: {stats['total_voyages']}")
    print(f"🟢 Active voyages: {stats['active_voyages']}")
    print(f"✅ Completed voyages: {stats['completed_voyages']}")
    print(f"📏 Total distance: {stats['total_distance']:.1f} km")
    print(f"⏱️  Total duration: {stats['total_duration']:.1f} hours")
    
    if stats['completed_voyages'] > 0:
        print(f"📊 Average voyage distance: {stats['average_voyage_distance']:.1f} km")
        print(f"📊 Average voyage duration: {stats['average_voyage_duration']:.1f} hours")
    
    # Show recent voyages
    recent_voyages = Voyage.objects.all()[:5]
    if recent_voyages:
        print(f"\n🕐 Recent voyages:")
        for voyage in recent_voyages:
            status_icon = "🟢" if voyage.is_active else "✅"
            print(f"   {status_icon} {voyage.vessel.name}: {voyage.start_port} → {voyage.end_port or 'Ongoing'}")

def test_api_key():
    """Test if the API key is working"""
    print("\n🔑 Testing API Key")
    print("=" * 18)
    
    api_key = aisstream_service.api_key
    if not api_key:
        print("❌ No API key configured!")
        return False
    
    print(f"🔑 API Key: {api_key[:10]}...")
    
    # This would require async context, so just check configuration
    print("✅ API key is configured")
    print("💡 Run 'python verify_real_data.py' for full connection test")
    return True

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage real ship data and voyages')
    parser.add_argument('--status', action='store_true', help='Show current data status')
    parser.add_argument('--start', action='store_true', help='Start real data collection')
    parser.add_argument('--stop', action='store_true', help='Stop data collection')
    parser.add_argument('--clear-demo', action='store_true', help='Clear demo data')
    parser.add_argument('--process-voyages', action='store_true', help='Process voyages for all vessels')
    parser.add_argument('--voyage-stats', action='store_true', help='Show voyage statistics')
    parser.add_argument('--test-key', action='store_true', help='Test API key')
    
    args = parser.parse_args()
    
    print("🚢 Maritime Platform - Real Data Manager")
    print("=" * 40)
    
    if args.status:
        show_data_status()
    elif args.start:
        start_real_data_collection()
    elif args.stop:
        stop_data_collection()
    elif args.clear_demo:
        clear_demo_data()
    elif args.process_voyages:
        process_voyages()
    elif args.voyage_stats:
        show_voyage_statistics()
    elif args.test_key:
        test_api_key()
    else:
        # Show menu
        print("\nAvailable commands:")
        print("  --status           Show current data status")
        print("  --start            Start real data collection")
        print("  --stop             Stop data collection")
        print("  --clear-demo       Clear demo data")
        print("  --process-voyages  Process voyages for all vessels")
        print("  --voyage-stats     Show voyage statistics")
        print("  --test-key         Test API key")
        print("\nExample: python manage_real_data.py --start")

if __name__ == "__main__":
    main()