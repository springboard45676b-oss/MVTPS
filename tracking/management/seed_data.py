from django.core.management.base import BaseCommand
from tracking.models import Port, Vessel, Voyage, Event
from django.utils import timezone

class Command(BaseCommand):
    help = "Seed initial maritime data"

    def handle(self, *args, **kwargs):
        mumbai, _ = Port.objects.get_or_create(
            name="Mumbai Port",
            code="INBOM",
            latitude=18.9398,
            longitude=72.8355
        )

        chennai, _ = Port.objects.get_or_create(
            name="Chennai Port",
            code="INMAA",
            latitude=13.0827,
            longitude=80.2707
        )

        vessel, _ = Vessel.objects.get_or_create(
            name="MV Sea Queen",
            mmsi="123456789",
            imo="IMO1234567",
            callsign="VQ123"
        )

        voyage, _ = Voyage.objects.get_or_create(
            vessel=vessel,
            origin=mumbai,
            destination=chennai,
            departure=timezone.now()
        )

        Event.objects.get_or_create(
            vessel=vessel,
            voyage=voyage,
            event_type="DEPARTURE",
            description="Vessel departed from Mumbai"
        )

        self.stdout.write(self.style.SUCCESS("✅ Sample data inserted successfully"))
