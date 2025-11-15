from django.core.management.base import BaseCommand
from destinations.models import City, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Check which destinations are missing images'

    def handle(self, *args, **options):
        self.stdout.write('=== CHECKING DESTINATIONS FOR MISSING IMAGES ===\n')

        self.stdout.write('CITIES:')
        cities_without_images = []
        for city in City.objects.all():
            has_image = bool(city.image_url)
            status = "✅" if has_image else "❌"
            self.stdout.write(f'{status} {city.name}, {city.country} - Image: {has_image}')
            if not has_image:
                cities_without_images.append(city)

        self.stdout.write('\nATTRACTIONS:')
        attractions_without_images = []
        for attraction in Attraction.objects.all():
            has_image = bool(attraction.image_url)
            status = "✅" if has_image else "❌"
            self.stdout.write(f'{status} {attraction.name} ({attraction.city}) - Image: {has_image}')
            if not has_image:
                attractions_without_images.append(attraction)

        self.stdout.write('\nHOTELS:')
        hotels_without_images = []
        for hotel in Hotel.objects.all():
            has_image = bool(hotel.image_url)
            status = "✅" if has_image else "❌"
            self.stdout.write(f'{status} {hotel.name} ({hotel.city}) - Image: {has_image}')
            if not has_image:
                hotels_without_images.append(hotel)

        self.stdout.write('\nRESTAURANTS:')
        restaurants_without_images = []
        for restaurant in Restaurant.objects.all():
            has_image = bool(restaurant.image_url)
            status = "✅" if has_image else "❌"
            self.stdout.write(f'{status} {restaurant.name} ({restaurant.city}) - Image: {has_image}')
            if not has_image:
                restaurants_without_images.append(restaurant)

        # Summary
        total_missing = len(cities_without_images) + len(attractions_without_images) + len(hotels_without_images) + len(restaurants_without_images)
        self.stdout.write(f'\n=== SUMMARY ===')
        self.stdout.write(f'Cities missing images: {len(cities_without_images)}')
        self.stdout.write(f'Attractions missing images: {len(attractions_without_images)}')
        self.stdout.write(f'Hotels missing images: {len(hotels_without_images)}')
        self.stdout.write(f'Restaurants missing images: {len(restaurants_without_images)}')
        self.stdout.write(f'Total destinations missing images: {total_missing}')

        if total_missing == 0:
            self.stdout.write(self.style.SUCCESS('\n🎉 All destinations have images!'))