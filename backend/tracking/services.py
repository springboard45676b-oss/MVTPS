import random
from .models import Vessel, Position

ROTTERDAM_LAT = 51.9244
ROTTERDAM_LON = 4.4777


def generate_fake_ais_data():
    vessels = Vessel.objects.all()

    for vessel in vessels:
        lat_offset = random.uniform(-0.5, 0.5)
        lon_offset = random.uniform(-0.5, 0.5)

        Position.objects.create(
            vessel=vessel,
            latitude=ROTTERDAM_LAT + lat_offset,
            longitude=ROTTERDAM_LON + lon_offset,
            speed=random.uniform(5, 20),
            course=random.uniform(0, 360),
        )
