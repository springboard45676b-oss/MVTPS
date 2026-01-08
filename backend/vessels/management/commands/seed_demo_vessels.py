from django.core.management.base import BaseCommand
from django.utils import timezone

from vessels.models import Vessel, VesselPosition


class Command(BaseCommand):
    """Seed the database with demo vessels and positions for LiveTracking.

    Creates ~18 vessels of different types (Cargo, Tanker, Container,
    Passenger, Fishing) and ensures each has at least one recent
    VesselPosition so they appear on the LiveTracking map.
    """

    help = "Seed demo vessels and positions for LiveTracking"

    VESSELS_DATA = [
        ("MV Ocean Voyager",   "111000001", "Cargo",     "Panama"),
        ("MV Sea Runner",      "111000002", "Cargo",     "Panama"),
        ("MV Baltic Trader",   "111000003", "Cargo",     "Liberia"),
        ("MV Coastal Carrier", "111000004", "Cargo",     "India"),

        ("MT Atlantic Spirit", "111000005", "Tanker",    "Liberia"),
        ("MT Gulf Stream",     "111000006", "Tanker",    "Bahamas"),
        ("MT Arctic Star",     "111000007", "Tanker",    "Norway"),
        ("MT Desert Rose",     "111000008", "Tanker",    "UAE"),

        ("CS Pacific Box",     "111000009", "Container", "Singapore"),
        ("CS Asia Express",    "111000010", "Container", "Singapore"),
        ("CS Europe Line",     "111000011", "Container", "Cyprus"),
        ("CS Atlantic Bridge", "111000012", "Container", "UK"),

        ("MS Ocean Dream",     "111000013", "Passenger", "Malta"),
        ("MS Island Sky",      "111000014", "Passenger", "Malta"),
        ("MS Coral Sea",       "111000015", "Passenger", "Australia"),

        ("FV Blue Marlin",     "111000016", "Fishing",   "Spain"),
        ("FV Northern Wind",   "111000017", "Fishing",   "Iceland"),
        ("FV Southern Star",   "111000018", "Fishing",   "South Africa"),
    ]

    def handle(self, *args, **options):
        created_vessels = 0
        created_positions = 0

        for name, mmsi, vtype, flag in self.VESSELS_DATA:
            vessel, v_created = Vessel.objects.get_or_create(
                mmsi=mmsi,
                defaults={
                    "name": name,
                    "vessel_type": vtype,
                    "flag": flag,
                },
            )
            if v_created:
                created_vessels += 1

            # Ensure at least one recent position so it appears on the map
            if not vessel.positions.exists():
                # Spread vessels in a rough grid so they are not on top of each other
                offset = int(mmsi[-2:]) % 20
                pos = VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=10 + offset,   # 10–29 degrees
                    longitude=70 + offset,  # 70–89 degrees
                    speed=12.0,
                    course=90.0,
                    heading=90.0,
                    timestamp=timezone.now(),
                )
                created_positions += 1

        total_vessels = Vessel.objects.count()
        total_positions = VesselPosition.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_vessels} new vessels and {created_positions} positions. "
                f"Total vessels: {total_vessels}, total positions: {total_positions}."
            )
        )
