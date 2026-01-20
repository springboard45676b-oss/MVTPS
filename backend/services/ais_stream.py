import websocket
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.conf import settings

AIS_API_KEY = getattr(settings, 'AIS_STREAM_API_KEY', '22fcb9b7d3d62955cd8984e267515edc3d4ca020')
AIS_WS_URL = "wss://stream.aisstream.io/v0/stream"

def on_message(ws, message):
    try:
        data = json.loads(message)
        
        # Extract vessel data from AIS Stream format
        if "Message" in data and "PositionReport" in data["Message"]:
            pos_report = data["Message"]["PositionReport"]
            vessel_data = {
                "mmsi": data["MetaData"]["MMSI"],
                "latitude": pos_report["Latitude"],
                "longitude": pos_report["Longitude"],
                "speed": pos_report.get("Sog", 0),
                "course": pos_report.get("Cog", 0),
                "heading": pos_report.get("TrueHeading", 0),
                "timestamp": data["MetaData"]["time_utc"],
                "vessel_name": data["MetaData"].get("ShipName", "Unknown"),
                "vessel_type": data["MetaData"].get("ShipType", "Unknown")
            }
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "ais_live",
                {
                    "type": "send_ais",
                    "data": vessel_data
                }
            )
    except Exception as e:
        print(f"Error processing AIS message: {e}")

def on_error(ws, error):
    print(f"AIS WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("AIS WebSocket connection closed")

def on_open(ws):
    print("AIS WebSocket connection opened")
    # Subscribe to specific area (adjust coordinates as needed)
    subscribe_message = {
        "APIKey": AIS_API_KEY,
        "BoundingBoxes": [[[32, -119], [34, -117]]]  # LA area
    }
    ws.send(json.dumps(subscribe_message))

def start_ais_stream():
    ws = websocket.WebSocketApp(
        AIS_WS_URL,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.run_forever()