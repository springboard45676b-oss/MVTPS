import os
import requests

class MarineTrafficService:
    def __init__(self):
        self.api_key = os.getenv("MARINETRAFFIC_API_KEY")

    def get_vessel_by_mmsi(self, mmsi):
        url = "https://services.marinetraffic.com/api/exportvessel/v:5"
        params = {
            "apikey": self.api_key,
            "mmsi": mmsi,
            "protocol": "jsono"
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()[0]

        return {
            "mmsi": data.get("MMSI"),
            "lat": float(data.get("LAT")),
            "lon": float(data.get("LON")),
            "speed": float(data.get("SPEED")),
            "course": float(data.get("COURSE"))
        }

