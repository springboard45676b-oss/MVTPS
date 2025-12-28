from typing import Optional, Dict, Any, Tuple
from django.utils import timezone
from django.db import transaction

from .models import Vessel, VesselPosition
from .ais_services import MarineTrafficService, AISHubService
from .ais_services.base import AISServiceBase


class VesselSyncError(Exception):
    """Exception raised for vessel synchronization errors."""
    pass


def sync_vessel_from_ais(
    mmsi: Optional[str] = None,
    imo: Optional[str] = None,
    service: Optional[AISServiceBase] = None,
    prefer_service: str = "marinetraffic"
) -> Tuple[Vessel, VesselPosition]:
    """
    Fetch vessel data from AIS service and save to database.
    
    Args:
        mmsi: MMSI number (required if imo not provided)
        imo: IMO number (required if mmsi not provided)
        service: AIS service instance (if None, will use prefer_service)
        prefer_service: Service to use if service is None ("marinetraffic" or "aishub")
        
    Returns:
        Tuple of (Vessel, VesselPosition) objects
        
    Raises:
        VesselSyncError: If sync fails
        ValueError: If neither mmsi nor imo provided
    """
    if not mmsi and not imo:
        raise ValueError("Either mmsi or imo must be provided")
    
    # Initialize service if not provided
    if service is None:
        try:
            if prefer_service.lower() == "aishub":
                service = AISHubService()
            else:
                service = MarineTrafficService()
        except ValueError as e:
            raise VesselSyncError(f"Failed to initialize AIS service: {str(e)}")
    
    # Fetch vessel data from AIS service
    try:
        if mmsi:
            ais_data = service.get_vessel_by_mmsi(mmsi)
        else:
            ais_data = service.get_vessel_by_imo(imo)
    except Exception as e:
        raise VesselSyncError(f"Failed to fetch vessel data from AIS service: {str(e)}")
    
    # Validate required fields
    if not ais_data.get("mmsi"):
        raise VesselSyncError("AIS service did not return MMSI")
    
    lat = ais_data.get("lat")
    lon = ais_data.get("lon")
    if lat is None or lon is None:
        raise VesselSyncError("AIS service did not return valid coordinates")
    
    # Parse timestamp
    timestamp = ais_data.get("last_update")
    if not timestamp:
        timestamp = timezone.now()
    elif isinstance(timestamp, str):
        # Try to parse string timestamp
        from datetime import datetime
        try:
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            timestamp = timezone.now()
    
    # Ensure timezone awareness
    if timezone.is_naive(timestamp):
        timestamp = timezone.make_aware(timestamp)
    
    with transaction.atomic():
        # Get or create vessel
        vessel, created = Vessel.objects.get_or_create(
            mmsi=ais_data["mmsi"],
            defaults={
                "imo": ais_data.get("imo"),
                "name": ais_data.get("name") or f"Vessel {ais_data['mmsi']}",
                "flag": ais_data.get("flag"),
                "vessel_type": ais_data.get("vessel_type"),
            }
        )
        
        # Update vessel fields if they changed (but don't overwrite with None)
        updated = False
        if ais_data.get("imo") and vessel.imo != ais_data.get("imo"):
            vessel.imo = ais_data.get("imo")
            updated = True
        if ais_data.get("name") and vessel.name != ais_data.get("name"):
            vessel.name = ais_data.get("name")
            updated = True
        if ais_data.get("flag") and vessel.flag != ais_data.get("flag"):
            vessel.flag = ais_data.get("flag")
            updated = True
        if ais_data.get("vessel_type") and vessel.vessel_type != ais_data.get("vessel_type"):
            vessel.vessel_type = ais_data.get("vessel_type")
            updated = True
        
        if updated:
            vessel.save(update_fields=["imo", "name", "flag", "vessel_type"])
        
        # Use get_or_create to avoid duplicate timestamps
        # This will create a new position or return existing one
        position, created = VesselPosition.objects.get_or_create(
            vessel=vessel,
            timestamp=timestamp,
            defaults={
                "latitude": ais_data["lat"],
                "longitude": ais_data["lon"],
                "speed": ais_data.get("speed"),
                "course": ais_data.get("course"),
                "heading": ais_data.get("heading"),
            }
        )
        
        # If position already existed, update it if coordinates changed significantly
        if not created:
            lat_diff = abs(position.latitude - ais_data["lat"])
            lon_diff = abs(position.longitude - ais_data["lon"])
            
            # Update if position changed significantly (more than ~11 meters)
            if lat_diff > 0.0001 or lon_diff > 0.0001:
                position.latitude = ais_data["lat"]
                position.longitude = ais_data["lon"]
                position.speed = ais_data.get("speed")
                position.course = ais_data.get("course")
                position.heading = ais_data.get("heading")
                position.save(update_fields=["latitude", "longitude", "speed", "course", "heading"])
        
        return vessel, position


def sync_vessels_batch(
    mmsi_list: Optional[list[str]] = None,
    imo_list: Optional[list[str]] = None,
    prefer_service: str = "marinetraffic"
) -> Dict[str, Any]:
    """
    Sync multiple vessels from AIS service.
    
    Args:
        mmsi_list: List of MMSI numbers
        imo_list: List of IMO numbers
        prefer_service: Service to use ("marinetraffic" or "aishub")
        
    Returns:
        Dict with summary: {"success": count, "failed": count, "errors": list}
    """
    results = {
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    # Initialize service once
    try:
        if prefer_service.lower() == "aishub":
            service = AISHubService()
        else:
            service = MarineTrafficService()
    except ValueError as e:
        results["errors"].append(f"Service initialization failed: {str(e)}")
        return results
    
    # Process MMSI list
    if mmsi_list:
        for mmsi in mmsi_list:
            try:
                sync_vessel_from_ais(mmsi=mmsi, service=service, prefer_service=prefer_service)
                results["success"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"MMSI {mmsi}: {str(e)}")
    
    # Process IMO list
    if imo_list:
        for imo in imo_list:
            try:
                sync_vessel_from_ais(imo=imo, service=service, prefer_service=prefer_service)
                results["success"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"IMO {imo}: {str(e)}")
    
    return results

