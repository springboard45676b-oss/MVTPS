from django.core.management.base import BaseCommand
from services.unctad_service import UNCTADService

class Command(BaseCommand):
    help = 'Sync UNCTAD port statistics data'

    def handle(self, *args, **options):
        self.stdout.write('Fetching UNCTAD port data...')
        
        try:
            count = UNCTADService.sync_to_database()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully synced {count} ports')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error syncing UNCTAD data: {str(e)}')
            )
