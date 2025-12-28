import os
from typing import Dict, Any, Optional
from datetime import datetime
from .base import AISServiceBase


class AISHubService(AISServiceBase):
    """Service for fetching vessel data from AIS Hub API."""
    
    BASE_URL = "https://www.aishub.net/ws.php"
    
    def _get_api_key(self) -> str:
        """Get AIS Hub API key from environment."""
        api_key = os.getenv("AISHUB_API_KEY")
        if not api_key:
            raise ValueError("AISHUB_API_KEY environment variable not set")
        return api_key
    
    def get_vessel_by_mmsi(self, mmsi: str) -> Dict[str, Any]:
        """
        Fetch vessel data by MMSI from AIS Hub.
        
        Args:
            mmsi: MMSI number
            
        Returns:
            Normalized vessel data dict
        """
        if not mmsi:
            raise ValueError("MMSI is required")
        
        params = {
            "username": self.api_key,
            "format": "JSON",
            "mmsi": mmsi
        }
        
        data = self._make_request(self.BASE_URL, params)
        
        # AIS Hub returns data in nested structure
        if not data or "positions" not in data or len(data["positions"]) == 0:
            raise ValueError(f"Vessel with MMSI {mmsi} not found")
        
        vessel_data = data["positions"][0]
        # Merge with metadata if available
        if "metadata" in data and len(data["metadata"]) > 0:
            vessel_data.update(data["metadata"][0])
        
        return self._normalize_response(vessel_data)
    
    def get_vessel_by_imo(self, imo: str) -> Dict[str, Any]:
        """
        Fetch vessel data by IMO from AIS Hub.
        
        Args:
            imo: IMO number
            
        Returns:
            Normalized vessel data dict
        """
        if not imo:
            raise ValueError("IMO is required")
        
        params = {
            "username": self.api_key,
            "format": "JSON",
            "imo": imo
        }
        
        data = self._make_request(self.BASE_URL, params)
        
        if not data or "positions" not in data or len(data["positions"]) == 0:
            raise ValueError(f"Vessel with IMO {imo} not found")
        
        vessel_data = data["positions"][0]
        # Merge with metadata if available
        if "metadata" in data and len(data["metadata"]) > 0:
            vessel_data.update(data["metadata"][0])
        
        return self._normalize_response(vessel_data)
    
    def _normalize_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize AIS Hub API response to standard format.
        
        Args:
            data: Raw API response data
            
        Returns:
            Normalized vessel data dict
        """
        # Parse last update timestamp
        last_update = None
        if data.get("timestamp") or data.get("TIME"):
            try:
                timestamp_value = data.get("timestamp") or data.get("TIME")
                # AIS Hub typically uses Unix timestamp
                try:
                    last_update = datetime.fromtimestamp(int(timestamp_value))
                except (ValueError, TypeError):
                    # Try ISO format
                    timestamp_str = str(timestamp_value)
                    for fmt in ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"]:
                        try:
                            last_update = datetime.strptime(timestamp_str, fmt)
                            break
                        except ValueError:
                            continue
            except Exception:
                pass
        
        return {
            "mmsi": self._safe_str(data.get("MMSI") or data.get("mmsi")),
            "imo": self._safe_str(data.get("IMO") or data.get("imo")),
            "name": self._safe_str(data.get("NAME") or data.get("name") or data.get("SHIPNAME")),
            "lat": self._safe_float(data.get("LAT") or data.get("lat") or data.get("LATITUDE")),
            "lon": self._safe_float(data.get("LON") or data.get("lon") or data.get("LONGITUDE")),
            "speed": self._safe_float(data.get("SPEED") or data.get("speed")),
            "course": self._safe_float(data.get("COURSE") or data.get("course")),
            "heading": self._safe_float(data.get("HEADING") or data.get("heading") or data.get("COURSE") or data.get("course")),
            "flag": self._safe_str(data.get("FLAG") or data.get("flag") or data.get("COUNTRY")),
            "vessel_type": self._safe_str(data.get("TYPE") or data.get("type") or data.get("SHIPTYPE") or data.get("shipType")),
            "last_update": last_update
        }

