from django.core.management.base import BaseCommand
from destinations.models import Attraction
import requests

class Command(BaseCommand):
    help = 'Test if attraction image URLs are accessible'

    def handle(self, *args, **options):
        self.stdout.write('Testing image URLs...')

        rome_attractions = Attraction.objects.filter(city__name='Rome', city__country='Italy')
        
        for attraction in rome_attractions:
            self.stdout.write(f'\n--- {attraction.name} ---')
            self.stdout.write(f'Image URL: {attraction.image_url}')
            
            if attraction.image_url:
                try:
                    # Test if the image URL is accessible
                    response = requests.head(attraction.image_url, timeout=10)
                    self.stdout.write(f'Status Code: {response.status_code}')
                    self.stdout.write(f'Content-Type: {response.headers.get("content-type", "Unknown")}')
                    
                    if response.status_code == 200:
                        self.stdout.write('✅ Image URL is accessible')
                    else:
                        self.stdout.write(f'❌ Image URL returned {response.status_code}')
                        
                        # Try to update with a simpler URL
                        simple_urls = [
                            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600',
                            'https://picsum.photos/800/600?random=1',
                            'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Colosseum'
                        ]
                        
                        for simple_url in simple_urls:
                            try:
                                test_response = requests.head(simple_url, timeout=5)
                                if test_response.status_code == 200:
                                    attraction.image_url = simple_url
                                    attraction.save()
                                    self.stdout.write(f'🔄 Updated to: {simple_url}')
                                    break
                            except:
                                continue
                        
                except requests.RequestException as e:
                    self.stdout.write(f'❌ Error accessing image: {str(e)}')
                    
                    # Update with a guaranteed working placeholder
                    placeholder_url = f'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text={attraction.name.replace(" ", "+")}'
                    attraction.image_url = placeholder_url
                    attraction.save()
                    self.stdout.write(f'🔄 Updated to placeholder: {placeholder_url}')
            else:
                self.stdout.write('❌ No image URL set')

        self.stdout.write(self.style.SUCCESS('\n✅ Image URL testing complete!'))