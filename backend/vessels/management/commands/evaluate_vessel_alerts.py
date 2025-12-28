from django.core.management.base import BaseCommand

from vessels.alerts import evaluate_vessel_alerts


class Command(BaseCommand):
    help = "Evaluate vessel alert subscriptions and create VesselAlert entries."

    def handle(self, *args, **options):
        created = evaluate_vessel_alerts()
        self.stdout.write(self.style.SUCCESS(f"Evaluated alerts, created {created} alerts."))
