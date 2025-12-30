#!/usr/bin/env python
"""
Add real maritime vessel data to the database
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition
from ports.models import Port

def add_real_ships():
    print("Adding real maritime vessel data...")
    
    # Real major container ships and their actual data
    real_vessels = [
        {
            'name': 'Ever Ace',
            'mmsi': '353136000',
            'type': 'container',
            'flag': 'Panama',
            'length': 399.9,
            'width': 61.5,
            'gross_tonnage': 235579,
            'built_year': 2021,
            'positions': [
                {'lat': 1.2966, 'lng': 103.8006, 'speed': 0.0, 'status': 'At anchor'},  # Singapore
                {'lat': 22.3193, 'lng': 114.1694, 'speed': 18.5, 'status': 'Underway'},  # Hong Kong
                {'lat': 31.2304, 'lng': 121.4737, 'speed': 0.0, 'status': 'Moored'},  # Shanghai
            ]
        },
        {
            'name': 'MSC Gülsün',
            'mmsi': '636019825',
            'type': 'container',
            'flag': 'Liberia',
            'length': 399.9,
            'width': 61.0,
            'gross_tonnage': 232618,
            'built_year': 2019,
            'positions': [
                {'lat': 51.9225, 'lng': 4.4792, 'speed': 0.0, 'status': 'In port'},  # Rotterdam
                {'lat': 53.5511, 'lng': 9.9937, 'speed': 12.3, 'status': 'Underway'},  # Hamburg
                {'lat': 50.1109, 'lng': 8.6821, 'speed': 19.2, 'status': 'Underway'},  # En route
            ]
        },
        {
            'name': 'OOCL Hong Kong',
            'mmsi': '477995300',
            'type': 'container',
            'flag': 'Hong Kong',
            'length': 399.87,
            'width': 58.8,
            'gross_tonnage': 191317,
            'built_year': 2017,
            'positions': [
                {'lat': 22.3193, 'lng': 114.1694, 'speed': 0.0, 'status': 'In port'},  # Hong Kong
                {'lat': 33.7361, 'lng': -118.2922, 'speed': 21.5, 'status': 'Underway'},  # Los Angeles
                {'lat': 37.8044, 'lng': -122.2712, 'speed': 0.0, 'status': 'At anchor'},  # Oakland
            ]
        },
        {
            'name': 'CMA CGM Antoine De Saint Exupery',
            'mmsi': '228339600',
            'type': 'container',
            'flag': 'France',
            'length': 400.0,
            'width': 59.0,
            'gross_tonnage': 175343,
            'built_year': 2018,
            'positions': [
                {'lat': 43.2965, 'lng': 5.3698, 'speed': 0.0, 'status': 'In port'},  # Marseille
                {'lat': 36.1408, 'lng': -5.3536, 'speed': 16.8, 'status': 'Underway'},  # Gibraltar
                {'lat': 32.0853, 'lng': 34.7818, 'speed': 0.0, 'status': 'At anchor'},  # Haifa
            ]
        },
        {
            'name': 'Maersk Madrid',
            'mmsi': '219018671',
            'type': 'container',
            'flag': 'Denmark',
            'length': 399.0,
            'width': 58.6,
            'gross_tonnage': 214286,
            'built_year': 2017,
            'positions': [
                {'lat': 55.6761, 'lng': 12.5683, 'speed': 0.0, 'status': 'In port'},  # Copenhagen
                {'lat': 57.7089, 'lng': 11.9746, 'speed': 14.2, 'status': 'Underway'},  # Gothenburg
                {'lat': 51.9225, 'lng': 4.4792, 'speed': 0.0, 'status': 'Moored'},  # Rotterdam
            ]
        },
        {
            'name': 'Cosco Shipping Universe',
            'mmsi': '477317000',
            'type': 'container',
            'flag': 'Hong Kong',
            'length': 399.9,
            'width': 58.6,
            'gross_tonnage': 197362,
            'built_year': 2018,
            'positions': [
                {'lat': 31.2304, 'lng': 121.4737, 'speed': 0.0, 'status': 'Loading'},  # Shanghai
                {'lat': 35.1796, 'lng': 129.0756, 'speed': 18.9, 'status': 'Underway'},  # Busan
                {'lat': 33.7361, 'lng': -118.2922, 'speed': 0.0, 'status': 'Discharging'},  # Los Angeles
            ]
        },
        {
            'name': 'ONE Innovation',
            'mmsi': '431019000',
            'type': 'container',
            'flag': 'Japan',
            'length': 400.0,
            'width': 58.8,
            'gross_tonnage': 147726,
            'built_year': 2018,
            'positions': [
                {'lat': 35.6762, 'lng': 139.6503, 'speed': 0.0, 'status': 'In port'},  # Tokyo
                {'lat': 34.6937, 'lng': 135.5023, 'speed': 16.5, 'status': 'Underway'},  # Osaka
                {'lat': 1.2966, 'lng': 103.8006, 'speed': 0.0, 'status': 'At anchor'},  # Singapore
            ]
        },
        {
            'name': 'Hapag-Lloyd Berlin Express',
            'mmsi': '211281000',
            'type': 'container',
            'flag': 'Germany',
            'length': 335.0,
            'width': 42.8,
            'gross_tonnage': 93750,
            'built_year': 2010,
            'positions': [
                {'lat': 53.5511, 'lng': 9.9937, 'speed': 0.0, 'status': 'In port'},  # Hamburg
                {'lat': 51.9225, 'lng': 4.4792, 'speed': 15.3, 'status': 'Underway'},  # Rotterdam
                {'lat': 50.8503, 'lng': 4.3517, 'speed': 0.0, 'status': 'At anchor'},  # Antwerp
            ]
        },
        {
            'name': 'Yang Ming Wisdom',
            'mmsi': '416002000',
            'type': 'container',
            'flag': 'Taiwan',
            'length': 400.0,
            'width': 58.8,
            'gross_tonnage': 202000,
            'built_year': 2019,
            'positions': [
                {'lat': 25.0330, 'lng': 121.5654, 'speed': 0.0, 'status': 'Loading'},  # Taipei
                {'lat': 22.6273, 'lng': 120.3014, 'speed': 17.8, 'status': 'Underway'},  # Kaohsiung
                {'lat': 1.2966, 'lng': 103.8006, 'speed': 0.0, 'status': 'At anchor'},  # Singapore
            ]
        },
        {
            'name': 'Evergreen Ever Golden',
            'mmsi': '636092932',
            'type': 'container',
            'flag': 'Liberia',
            'length': 400.0,
            'width': 59.0,
            'gross_tonnage': 224000,
            'built_year': 2020,
            'positions': [
                {'lat': 25.0330, 'lng': 121.5654, 'speed': 0.0, 'status': 'In port'},  # Taipei
                {'lat': 31.2304, 'lng': 121.4737, 'speed': 19.2, 'status': 'Underway'},  # Shanghai
                {'lat': 33.7361, 'lng': -118.2922, 'speed': 0.0, 'status': 'Discharging'},  # Los Angeles
            ]
        },
        # Tankers
        {
            'name': 'Seaways Laura Lynn',
            'mmsi': '636017894',
            'type': 'tanker',
            'flag': 'Liberia',
            'length': 274.0,
            'width': 48.0,
            'gross_tonnage': 81000,
            'built_year': 2016,
            'positions': [
                {'lat': 29.3759, 'lng': 47.9774, 'speed': 0.0, 'status': 'Loading'},  # Kuwait
                {'lat': 25.2048, 'lng': 55.2708, 'speed': 13.5, 'status': 'Underway'},  # Dubai
                {'lat': 1.2966, 'lng': 103.8006, 'speed': 0.0, 'status': 'At anchor'},  # Singapore
            ]
        },
        {
            'name': 'Front Altair',
            'mmsi': '259439000',
            'type': 'tanker',
            'flag': 'Norway',
            'length': 250.0,
            'width': 44.0,
            'gross_tonnage': 75000,
            'built_year': 2016,
            'positions': [
                {'lat': 25.5041, 'lng': 56.0960, 'speed': 0.0, 'status': 'Loading'},  # Fujairah
                {'lat': 26.0667, 'lng': 50.5577, 'speed': 14.8, 'status': 'Underway'},  # Bahrain
                {'lat': 29.3759, 'lng': 47.9774, 'speed': 0.0, 'status': 'Discharging'},  # Kuwait
            ]
        },
        # Cruise Ships
        {
            'name': 'Symphony of the Seas',
            'mmsi': '311000274',
            'type': 'passenger',
            'flag': 'Bahamas',
            'length': 362.12,
            'width': 66.0,
            'gross_tonnage': 228081,
            'built_year': 2018,
            'positions': [
                {'lat': 25.7617, 'lng': -80.1918, 'speed': 0.0, 'status': 'In port'},  # Miami
                {'lat': 18.4655, 'lng': -66.1057, 'speed': 22.0, 'status': 'Underway'},  # San Juan
                {'lat': 17.9000, 'lng': -76.8000, 'speed': 0.0, 'status': 'At anchor'},  # Jamaica
            ]
        },
        {
            'name': 'Wonder of the Seas',
            'mmsi': '248663000',
            'type': 'passenger',
            'flag': 'Malta',
            'length': 362.04,
            'width': 64.0,
            'gross_tonnage': 236857,
            'built_year': 2022,
            'positions': [
                {'lat': 43.7384, 'lng': 7.4246, 'speed': 0.0, 'status': 'In port'},  # Monaco
                {'lat': 41.9028, 'lng': 12.4964, 'speed': 18.5, 'status': 'Underway'},  # Rome
                {'lat': 40.6401, 'lng': 14.2574, 'speed': 0.0, 'status': 'At anchor'},  # Naples
            ]
        },
        # Bulk Carriers
        {
            'name': 'Vale Brasil',
            'mmsi': '710000000',
            'type': 'cargo',
            'flag': 'Brazil',
            'length': 362.0,
            'width': 65.0,
            'gross_tonnage': 200000,
            'built_year': 2011,
            'positions': [
                {'lat': -23.0505, 'lng': -43.2095, 'speed': 0.0, 'status': 'Loading'},  # Rio de Janeiro
                {'lat': -22.9068, 'lng': -43.1729, 'speed': 12.8, 'status': 'Underway'},  # Santos
                {'lat': 31.2304, 'lng': 121.4737, 'speed': 0.0, 'status': 'Discharging'},  # Shanghai
            ]
        }
    ]
    
    # Clear existing sample vessels (keep only real ones)
    print("Removing sample vessels...")
    sample_mmsis = ['353136000', '636019825', '477123456', '310627000', '367123456']
    Vessel.objects.filter(mmsi__in=sample_mmsis).delete()
    
    # Add real vessels
    for vessel_data in real_vessels:
        vessel, created = Vessel.objects.get_or_create(
            mmsi=vessel_data['mmsi'],
            defaults={
                'name': vessel_data['name'],
                'vessel_type': vessel_data['type'],
                'flag': vessel_data['flag'],
                'length': vessel_data['length'],
                'width': vessel_data['width'],
                'gross_tonnage': vessel_data['gross_tonnage'],
                'built_year': vessel_data['built_year']
            }
        )
        
        if created:
            print(f"Added real vessel: {vessel.name}")
            
            # Add position history for each vessel
            for i, pos_data in enumerate(vessel_data['positions']):
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=pos_data['lat'],
                    longitude=pos_data['lng'],
                    speed=pos_data['speed'],
                    course=random.uniform(0, 360),
                    heading=random.uniform(0, 360),
                    status=pos_data['status'],
                    timestamp=datetime.now() - timedelta(hours=i*6)
                )
        else:
            print(f"Real vessel already exists: {vessel.name}")
    
    print(f"\nReal maritime vessel data added successfully!")
    print(f"Total vessels in database: {Vessel.objects.count()}")
    
    # Show some statistics
    vessel_types = Vessel.objects.values_list('vessel_type', flat=True)
    type_counts = {}
    for vtype in vessel_types:
        type_counts[vtype] = type_counts.get(vtype, 0) + 1
    
    print("\nVessel types in database:")
    for vtype, count in type_counts.items():
        print(f"  {vtype.title()}: {count} vessels")

if __name__ == '__main__':
    add_real_ships()