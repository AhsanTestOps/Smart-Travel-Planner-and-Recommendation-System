from django.core.management.base import BaseCommand
from destinations.models import Attraction

class Command(BaseCommand):
    help = 'Fix the Colosseum image URL'

    def handle(self, *args, **options):
        self.stdout.write('Fixing Colosseum image...')

        # Better Colosseum images from Unsplash
        colosseum_images = [
            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop&auto=format'
        ]

        try:
            colosseum = Attraction.objects.get(name='Colosseum')
            old_url = colosseum.image_url
            
            # Try the first high-quality image
            new_url = colosseum_images[0]
            colosseum.image_url = new_url
            colosseum.save()
            
            self.stdout.write(f'✅ Updated Colosseum image')
            self.stdout.write(f'Old URL: {old_url}')
            self.stdout.write(f'New URL: {new_url}')
            
        except Attraction.DoesNotExist:
            self.stdout.write('❌ Colosseum not found!')

        # Let's also check and update all Rome attractions images
        self.stdout.write('\n=== UPDATING ALL ROME ATTRACTIONS ===')
        from destinations.models import City
        
        rome = City.objects.get(name='Rome', country='Italy')
        rome_attractions = rome.attractions.all()
        
        for attraction in rome_attractions:
            self.stdout.write(f'{attraction.name}: {attraction.image_url}')

        self.stdout.write(self.style.SUCCESS('\n🎉 Image update complete!'))