#!/usr/bin/env python3
"""
View voyage track for a specific vessel
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition, Voyage

def list_vessels():
    """List all available vessels"""
    print("🚢 Available Vessels:")
    print("=" * 50)
    
    vessels = Vessel.objects.all()
    for i, vessel in enumerate(vessels, 1):
        voyage_count = vessel.vessel_voyages.count()
        position_count = vessel.positions.count()
        latest_position = vessel.positions.first()
        
        print(f"{i:2d}. {vessel.name}")
        print(f"    MMSI: {vessel.mmsi}")
        print(f"    Type: {vessel.vessel_type}")
        print(f"    Voyages: {voyage_count}")
        print(f"    Positions: {position_count}")
        if latest_position:
            print(f"    Last seen: {latest_position.timestamp}")
        print()

def show_vessel_voyages(vessel_name_or_mmsi):
    """Show all voyages for a specific vessel"""
    try:
        # Try to find vessel by name or MMSI
        if vessel_name_or_mmsi.isdigit():
            vessel = Vessel.objects.get(mmsi=vessel_name_or_mmsi)
        else:
            vessel = Vessel.objects.get(name__icontains=vessel_name_or_mmsi)
    except Vessel.DoesNotExist:
        print(f"❌ Vessel '{vessel_name_or_mmsi}' not found")
        return
    except Vessel.MultipleObjectsReturned:
        print(f"❌ Multiple vessels found matching '{vessel_name_or_mmsi}'")
        vessels = Vessel.objects.filter(name__icontains=vessel_name_or_mmsi)
        print("Available options:")
        for v in vessels:
            print(f"   - {v.name} ({v.mmsi})")
        return
    
    print(f"🚢 Voyage History for: {vessel.name}")
    print(f"📋 MMSI: {vessel.mmsi}")
    print("=" * 60)
    
    voyages = vessel.vessel_voyages.all()
    
    if not voyages:
        print("❌ No voyages found for this vessel")
        return
    
    for i, voyage in enumerate(voyages, 1):
        status_icon = "🟢" if voyage.is_active else "✅"
        print(f"\n{status_icon} Voyage #{i} ({voyage.status.upper()})")
        print(f"   🏁 Start: {voyage.start_port} ({voyage.start_time})")
        print(f"   📍 Start Position: {voyage.start_latitude:.4f}, {voyage.start_longitude:.4f}")
        
        if voyage.end_time:
            print(f"   🏁 End: {voyage.end_port} ({voyage.end_time})")
            print(f"   📍 End Position: {voyage.end_latitude:.4f}, {voyage.end_longitude:.4f}")
        else:
            print(f"   🏁 End: Ongoing")
        
        if voyage.distance_km:
            print(f"   📏 Distance: {voyage.distance_km:.1f} km")
        if voyage.duration_hours:
            print(f"   ⏱️  Duration: {voyage.duration_display}")
        if voyage.average_speed:
            print(f"   🏃 Average Speed: {voyage.average_speed:.1f} knots")

def show_vessel_track(vessel_name_or_mmsi, limit=50):
    """Show detailed position track for a vessel"""
    try:
        if vessel_name_or_mmsi.isdigit():
            vessel = Vessel.objects.get(mmsi=vessel_name_or_mmsi)
        else:
            vessel = Vessel.objects.get(name__icontains=vessel_name_or_mmsi)
    except Vessel.DoesNotExist:
        print(f"❌ Vessel '{vessel_name_or_mmsi}' not found")
        return
    
    print(f"🗺️  Position Track for: {vessel.name}")
    print(f"📋 MMSI: {vessel.mmsi}")
    print("=" * 60)
    
    positions = vessel.positions.all()[:limit]
    
    if not positions:
        print("❌ No position data found for this vessel")
        return
    
    print(f"📍 Showing last {len(positions)} positions:\n")
    
    for i, pos in enumerate(positions, 1):
        age = datetime.now() - pos.timestamp.replace(tzinfo=None)
        age_str = f"{age.total_seconds()/3600:.1f}h ago"
        
        print(f"{i:2d}. {pos.timestamp} ({age_str})")
        print(f"    📍 Position: {pos.latitude:.6f}, {pos.longitude:.6f}")
        print(f"    🏃 Speed: {pos.speed:.1f} knots")
        print(f"    🧭 Course: {pos.course:.0f}°")
        print(f"    📊 Status: {pos.status}")
        print()

def export_track_to_csv(vessel_name_or_mmsi, filename=None):
    """Export vessel track to CSV file"""
    try:
        if vessel_name_or_mmsi.isdigit():
            vessel = Vessel.objects.get(mmsi=vessel_name_or_mmsi)
        else:
            vessel = Vessel.objects.get(name__icontains=vessel_name_or_mmsi)
    except Vessel.DoesNotExist:
        print(f"❌ Vessel '{vessel_name_or_mmsi}' not found")
        return
    
    if not filename:
        safe_name = vessel.name.replace(' ', '_').replace('/', '_')
        filename = f"{safe_name}_track.csv"
    
    positions = vessel.positions.all()
    
    if not positions:
        print("❌ No position data found for this vessel")
        return
    
    import csv
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Header
        writer.writerow([
            'timestamp', 'latitude', 'longitude', 'speed', 'course', 
            'heading', 'status', 'vessel_name', 'mmsi'
        ])
        
        # Data
        for pos in positions:
            writer.writerow([
                pos.timestamp,
                pos.latitude,
                pos.longitude,
                pos.speed,
                pos.course,
                pos.heading,
                pos.status,
                vessel.name,
                vessel.mmsi
            ])
    
    print(f"✅ Track exported to: {filename}")
    print(f"📊 {len(positions)} positions exported")

def create_track_map(vessel_name_or_mmsi):
    """Create a simple HTML map showing vessel track"""
    try:
        if vessel_name_or_mmsi.isdigit():
            vessel = Vessel.objects.get(mmsi=vessel_name_or_mmsi)
        else:
            vessel = Vessel.objects.get(name__icontains=vessel_name_or_mmsi)
    except Vessel.DoesNotExist:
        print(f"❌ Vessel '{vessel_name_or_mmsi}' not found")
        return
    
    positions = vessel.positions.all()[:100]  # Last 100 positions
    
    if not positions:
        print("❌ No position data found for this vessel")
        return
    
    # Create HTML map
    safe_name = vessel.name.replace(' ', '_').replace('/', '_')
    filename = f"{safe_name}_map.html"
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{vessel.name} - Voyage Track</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
</head>
<body>
    <h1>🚢 {vessel.name} - Voyage Track</h1>
    <p><strong>MMSI:</strong> {vessel.mmsi} | <strong>Type:</strong> {vessel.vessel_type}</p>
    <div id="map" style="height: 600px;"></div>
    
    <script>
        // Initialize map
        var map = L.map('map').setView([{positions[0].latitude}, {positions[0].longitude}], 6);
        
        // Add tile layer
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            attribution: '© OpenStreetMap contributors'
        }}).addTo(map);
        
        // Track points
        var trackPoints = [
"""
    
    # Add position data
    for pos in positions:
        html_content += f"            [{pos.latitude}, {pos.longitude}],\n"
    
    html_content += f"""
        ];
        
        // Create polyline for track
        var track = L.polyline(trackPoints, {{color: 'blue', weight: 3}}).addTo(map);
        
        # Add markers for start and end
        var startPos = trackPoints[trackPoints.length - 1];
        var endPos = trackPoints[0];
        
        L.marker(startPos)
            .addTo(map)
            .bindPopup('<b>Start Position</b><br>{positions.last().timestamp}');
            
        L.marker(endPos)
            .addTo(map)
            .bindPopup('<b>Latest Position</b><br>{positions.first().timestamp}');
        
        // Fit map to track
        map.fitBounds(track.getBounds());
        
        // Add position info
        var info = L.control({{position: 'topright'}});
        info.onAdd = function (map) {{
            var div = L.DomUtil.create('div', 'info');
            div.innerHTML = '<h4>Track Info</h4>' +
                           '<b>Positions:</b> {len(positions)}<br>' +
                           '<b>Latest:</b> {positions[0].timestamp}<br>' +
                           '<b>Speed:</b> {positions[0].speed} knots';
            return div;
        }};
        info.addTo(map);
    </script>
    
    <style>
        .info {{
            padding: 6px 8px;
            font: 14px/16px Arial, Helvetica, sans-serif;
            background: white;
            background: rgba(255,255,255,0.8);
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            border-radius: 5px;
        }}
    </style>
</body>
</html>
"""
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Map created: {filename}")
    print(f"🗺️  Open in browser to view vessel track")
    print(f"📊 {len(positions)} positions plotted")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='View vessel voyage tracks')
    parser.add_argument('--list', action='store_true', help='List all vessels')
    parser.add_argument('--vessel', type=str, help='Vessel name or MMSI')
    parser.add_argument('--voyages', action='store_true', help='Show voyage history')
    parser.add_argument('--track', action='store_true', help='Show position track')
    parser.add_argument('--export', action='store_true', help='Export track to CSV')
    parser.add_argument('--map', action='store_true', help='Create HTML map')
    parser.add_argument('--limit', type=int, default=50, help='Limit number of positions')
    
    args = parser.parse_args()
    
    if args.list:
        list_vessels()
    elif args.vessel:
        if args.voyages:
            show_vessel_voyages(args.vessel)
        elif args.track:
            show_vessel_track(args.vessel, args.limit)
        elif args.export:
            export_track_to_csv(args.vessel)
        elif args.map:
            create_track_map(args.vessel)
        else:
            # Default: show voyages
            show_vessel_voyages(args.vessel)
    else:
        print("🚢 Vessel Voyage Track Viewer")
        print("=" * 30)
        print("\nUsage examples:")
        print("  python view_voyage_track.py --list")
        print("  python view_voyage_track.py --vessel 'Maersk Madrid' --voyages")
        print("  python view_voyage_track.py --vessel 228339600 --track")
        print("  python view_voyage_track.py --vessel 'CMA CGM' --export")
        print("  python view_voyage_track.py --vessel 'Wonder' --map")
        print("\nOptions:")
        print("  --list      List all available vessels")
        print("  --voyages   Show voyage history")
        print("  --track     Show detailed position track")
        print("  --export    Export track to CSV file")
        print("  --map       Create interactive HTML map")
        print("  --limit N   Limit positions shown (default: 50)")

if __name__ == "__main__":
    main()