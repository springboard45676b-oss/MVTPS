import os
from typing import Dict, Any, Optional
from datetime import datetime
from .base import AISServiceBase


class MarineTrafficService(AISServiceBase):
    """Service for fetching vessel data from MarineTraffic API."""
    
    BASE_URL = "https://services.marinetraffic.com/api/exportvessel/v:5"
    
    def _get_api_key(self) -> str:
        """Get MarineTraffic API key from environment."""
        api_key = os.getenv("MARINETRAFFIC_API_KEY")
        if not api_key:
            raise ValueError("MARINETRAFFIC_API_KEY environment variable not set")
        return api_key
    
    def get_vessel_by_mmsi(self, mmsi: str) -> Dict[str, Any]:
        """
        Fetch vessel data by MMSI from MarineTraffic.
        
        Args:
            mmsi: MMSI number
            
        Returns:
            Normalized vessel data dict
        """
        if not mmsi:
            raise ValueError("MMSI is required")
        
        params = {
            "apikey": self.api_key,
            "mmsi": mmsi,
            "protocol": "jsono"
        }
        
        data = self._make_request(self.BASE_URL, params)
        
        if not data or len(data) == 0:
            raise ValueError(f"Vessel with MMSI {mmsi} not found")
        
        vessel_data = data[0]
        return self._normalize_response(vessel_data)
    
    def get_vessel_by_imo(self, imo: str) -> Dict[str, Any]:
        """
        Fetch vessel data by IMO from MarineTraffic.
        
        Args:
            imo: IMO number
            
        Returns:
            Normalized vessel data dict
        """
        if not imo:
            raise ValueError("IMO is required")
        
        params = {
            "apikey": self.api_key,
            "imo": imo,
            "protocol": "jsono"
        }
        
        data = self._make_request(self.BASE_URL, params)
        
        if not data or len(data) == 0:
            raise ValueError(f"Vessel with IMO {imo} not found")
        
        vessel_data = data[0]
        return self._normalize_response(vessel_data)
    
    def _normalize_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize MarineTraffic API response to standard format.
        
        Args:
            data: Raw API response data
            
        Returns:
            Normalized vessel data dict
        """
        # Parse last update timestamp
        last_update = None
        if data.get("TIMESTAMP"):
            try:
                # MarineTraffic timestamp format varies, try common formats
                timestamp_str = str(data.get("TIMESTAMP"))
                # Try parsing as Unix timestamp
                try:
                    last_update = datetime.fromtimestamp(int(timestamp_str))
                except (ValueError, TypeError):
                    # Try ISO format or other formats
                    for fmt in ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"]:
                        try:
                            last_update = datetime.strptime(timestamp_str, fmt)
                            break
                        except ValueError:
                            continue
            except Exception:
                pass
        
        return {
            "mmsi": self._safe_str(data.get("MMSI")),
            "imo": self._safe_str(data.get("IMO")),
            "name": self._safe_str(data.get("SHIPNAME") or data.get("NAME")),
            "lat": self._safe_float(data.get("LAT")),
            "lon": self._safe_float(data.get("LON")),
            "speed": self._safe_float(data.get("SPEED")),
            "course": self._safe_float(data.get("COURSE")),
            "heading": self._safe_float(data.get("HEADING") or data.get("COURSE")),
            "flag": self._safe_str(data.get("FLAG")),
            "vessel_type": self._safe_str(data.get("TYPE") or data.get("SHIPTYPE")),
            "last_update": last_update
        }

