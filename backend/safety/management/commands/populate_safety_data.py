from django.core.management.base import BaseCommand
from services.safety_data_service import SafetyDataService

class Command(BaseCommand):
    help = 'Populate safety data (weather, piracy zones, accidents)'

    def handle(self, *args, **options):
        self.stdout.write('Generating safety data...')
        
        try:
            result = SafetyDataService.populate_all()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created:\n"
                    f"  - {result['weather_alerts']} weather alerts\n"
                    f"  - {result['piracy_zones']} piracy zones\n"
                    f"  - {result['accidents']} accident records"
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error generating safety data: {str(e)}')
            )
