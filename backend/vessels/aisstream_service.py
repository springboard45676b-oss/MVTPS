"""
AIS Stream API Integration Service
Fetches live vessel data from aisstream.io WebSocket API
"""

import asyncio
import websockets
import json
import logging
from datetime import datetime, timezone
from django.conf import settings
from .models import Vessel, VesselPosition
from asgiref.sync import sync_to_async
import threading
import time

logger = logging.getLogger(__name__)

class AISStreamService:
    def __init__(self):
        self.websocket_url = "wss://stream.aisstream.io/v0/stream"
        self.is_connected = False
        self.connection_thread = None
        self.should_stop = False
        self.vessel_cache = {}
        self.last_update = None
    
    def get_api_key(self):
        """Get API key from settings"""
        return getattr(settings, 'AISSTREAM_API_KEY', None)
    
    @property
    def api_key(self):
        """Get API key from settings dynamically"""
        return self.get_api_key()
        
    def get_subscription_message(self, bounds=None):
        """Create subscription message for AIS Stream"""
        # Default to global coverage if no bounds specified
        if bounds:
            bounding_boxes = [[
                [bounds.get('minlat', -90), bounds.get('minlon', -180)],
                [bounds.get('maxlat', 90), bounds.get('maxlon', 180)]
            ]]
        else:
            # Global coverage
            bounding_boxes = [[[-90, -180], [90, 180]]]
        
        return {
            "APIKey": self.api_key,
            "BoundingBoxes": bounding_boxes,
            "FilterMessageTypes": ["PositionReport", "ShipStaticData"]
        }
    
    async def connect_and_stream(self, bounds=None):
        """Connect to AIS Stream and process messages"""
        if not self.api_key:
            logger.error("AIS Stream API key not configured")
            return
        
        try:
            async with websockets.connect(self.websocket_url) as websocket:
                logger.info("Connected to AIS Stream")
                self.is_connected = True
                
                # Send subscription message
                subscription = self.get_subscription_message(bounds)
                await websocket.send(json.dumps(subscription))
                logger.info("Subscription sent to AIS Stream")
                
                # Process incoming messages
                async for message_json in websocket:
                    if self.should_stop:
                        break
                        
                    try:
                        message = json.loads(message_json)
                        await self.process_ais_message(message)
                    except Exception as e:
                        logger.error(f"Error processing AIS message: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"AIS Stream connection error: {e}")
        finally:
            self.is_connected = False
            logger.info("Disconnected from AIS Stream")
    
    async def process_ais_message(self, message):
        """Process individual AIS message"""
        try:
            message_type = message.get("MessageType")
            metadata = message.get("MetaData", {})
            
            if message_type == "PositionReport":
                await self.process_position_report(message, metadata)
            elif message_type == "ShipStaticData":
                await self.process_ship_static_data(message, metadata)
                
        except Exception as e:
            logger.error(f"Error processing AIS message type {message_type}: {e}")
    
    async def process_position_report(self, message, metadata):
        """Process position report message"""
        try:
            position_data = message["Message"]["PositionReport"]
            mmsi = str(metadata.get("MMSI", position_data.get("UserID", "")))
            
            if not mmsi:
                return
            
            # Get vessel data
            vessel_data = {
                'mmsi': mmsi,
                'name': metadata.get('ShipName', 'Unknown'),
                'latitude': float(position_data.get('Latitude', 0)),
                'longitude': float(position_data.get('Longitude', 0)),
                'speed': float(position_data.get('Sog', 0)),  # Speed over ground
                'course': float(position_data.get('Cog', 0)),  # Course over ground
                'heading': float(position_data.get('TrueHeading', 0)),
                'status': self._get_navigation_status(position_data.get('NavigationalStatus', 15)),
                'timestamp': datetime.now(timezone.utc),
            }
            
            # Cache vessel data for batch processing
            self.vessel_cache[mmsi] = vessel_data
            
            # Process batch every 100 vessels or every 30 seconds
            if len(self.vessel_cache) >= 100 or self._should_process_batch():
                await self._process_vessel_batch()
                
        except Exception as e:
            logger.error(f"Error processing position report: {e}")
    
    async def process_ship_static_data(self, message, metadata):
        """Process ship static data message"""
        try:
            static_data = message["Message"]["ShipStaticData"]
            mmsi = str(metadata.get("MMSI", static_data.get("UserID", "")))
            
            if not mmsi:
                return
            
            # Update vessel static information
            vessel_info = {
                'mmsi': mmsi,
                'name': static_data.get('Name', 'Unknown').strip(),
                'vessel_type': self._get_vessel_type(static_data.get('Type', 0)),
                'call_sign': static_data.get('CallSign', '').strip(),
                'length': static_data.get('Dimension', {}).get('A', 0) + static_data.get('Dimension', {}).get('B', 0),
                'width': static_data.get('Dimension', {}).get('C', 0) + static_data.get('Dimension', {}).get('D', 0),
                'destination': static_data.get('Destination', '').strip(),
            }
            
            await self._update_vessel_static_data(vessel_info)
            
        except Exception as e:
            logger.error(f"Error processing ship static data: {e}")
    
    def _should_process_batch(self):
        """Check if we should process the current batch"""
        if not self.last_update:
            self.last_update = time.time()
            return False
        
        return time.time() - self.last_update > 30  # 30 seconds
    
    async def _process_vessel_batch(self):
        """Process cached vessel data in batch"""
        if not self.vessel_cache:
            return
        
        try:
            vessels_to_process = list(self.vessel_cache.values())
            self.vessel_cache.clear()
            self.last_update = time.time()
            
            # Process vessels in database
            for vessel_data in vessels_to_process:
                await self._update_vessel_position(vessel_data)
                
            logger.info(f"Processed batch of {len(vessels_to_process)} vessels")
            
        except Exception as e:
            logger.error(f"Error processing vessel batch: {e}")
    
    @sync_to_async
    def _update_vessel_position(self, vessel_data):
        """Update vessel position in database"""
        try:
            # Get or create vessel
            vessel, created = Vessel.objects.get_or_create(
                mmsi=vessel_data['mmsi'],
                defaults={
                    'name': vessel_data['name'],
                    'vessel_type': 'other',  # Will be updated by static data
                }
            )
            
            # Create position record
            VesselPosition.objects.create(
                vessel=vessel,
                latitude=vessel_data['latitude'],
                longitude=vessel_data['longitude'],
                speed=vessel_data['speed'],
                course=vessel_data['course'],
                heading=vessel_data['heading'],
                status=vessel_data['status'],
                timestamp=vessel_data['timestamp']
            )
            
        except Exception as e:
            logger.error(f"Error updating vessel position for {vessel_data['mmsi']}: {e}")
    
    @sync_to_async
    def _update_vessel_static_data(self, vessel_info):
        """Update vessel static information"""
        try:
            vessel, created = Vessel.objects.get_or_create(
                mmsi=vessel_info['mmsi'],
                defaults=vessel_info
            )
            
            if not created:
                # Update existing vessel with new static data
                for key, value in vessel_info.items():
                    if key != 'mmsi' and value:  # Don't update empty values
                        setattr(vessel, key, value)
                vessel.save()
                
        except Exception as e:
            logger.error(f"Error updating vessel static data for {vessel_info['mmsi']}: {e}")
    
    def _get_navigation_status(self, status_code):
        """Convert AIS navigation status code to readable status"""
        status_map = {
            0: 'Under way using engine',
            1: 'At anchor',
            2: 'Not under command',
            3: 'Restricted manoeuvrability',
            4: 'Constrained by her draught',
            5: 'Moored',
            6: 'Aground',
            7: 'Engaged in fishing',
            8: 'Under way sailing',
            9: 'Reserved for future amendment',
            10: 'Reserved for future amendment',
            11: 'Power-driven vessel towing astern',
            12: 'Power-driven vessel pushing ahead',
            13: 'Reserved for future use',
            14: 'AIS-SART is active',
            15: 'Not defined'
        }
        return status_map.get(status_code, 'Unknown')
    
    def _get_vessel_type(self, type_code):
        """Convert AIS vessel type code to our vessel type"""
        # AIS vessel type codes mapping
        if 70 <= type_code <= 79:
            return 'cargo'
        elif 80 <= type_code <= 89:
            return 'tanker'
        elif 60 <= type_code <= 69:
            return 'passenger'
        elif 30 <= type_code <= 39:
            return 'fishing'
        elif type_code in [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]:
            return 'other'  # Special craft
        else:
            return 'other'
    
    def start_streaming(self, bounds=None):
        """Start streaming AIS data in background thread"""
        if self.connection_thread and self.connection_thread.is_alive():
            logger.warning("AIS Stream already running")
            return
        
        self.should_stop = False
        self.connection_thread = threading.Thread(
            target=self._run_async_stream,
            args=(bounds,),
            daemon=True
        )
        self.connection_thread.start()
        logger.info("Started AIS Stream background thread")
    
    def stop_streaming(self):
        """Stop streaming AIS data"""
        self.should_stop = True
        if self.connection_thread:
            self.connection_thread.join(timeout=5)
        logger.info("Stopped AIS Stream")
    
    def _run_async_stream(self, bounds):
        """Run async stream in thread"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.connect_and_stream(bounds))
        except Exception as e:
            logger.error(f"Error in AIS Stream thread: {e}")
        finally:
            loop.close()
    
    def get_cached_vessels(self):
        """Get currently cached vessel data"""
        return list(self.vessel_cache.values())
    
    def is_streaming(self):
        """Check if currently streaming"""
        return self.is_connected and self.connection_thread and self.connection_thread.is_alive()

# Global instance
aisstream_service = AISStreamService()