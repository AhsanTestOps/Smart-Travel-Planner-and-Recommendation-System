from django.core.management.base import BaseCommand
from django.db import models
from destinations.models import City, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Check and fix city assignments for all destinations'

    def handle(self, *args, **options):
        self.stdout.write('Checking city assignments for all destinations...')

        # Check all cities and their destinations
        for city in City.objects.all():
            attractions_count = city.attractions.count()
            hotels_count = city.hotels.count()
            restaurants_count = city.restaurants.count()
            total = attractions_count + hotels_count + restaurants_count
            
            self.stdout.write(f'\n=== {city.name}, {city.country} (ID: {city.id}) ===')
            self.stdout.write(f'Total destinations: {total} (A:{attractions_count}, H:{hotels_count}, R:{restaurants_count})')
            
            if attractions_count > 0:
                self.stdout.write('Attractions:')
                for attr in city.attractions.all():
                    self.stdout.write(f'  - {attr.name} (ID: {attr.id})')
                    
            if hotels_count > 0:
                self.stdout.write('Hotels:')
                for hotel in city.hotels.all():
                    self.stdout.write(f'  - {hotel.name} (ID: {hotel.id})')
                    
            if restaurants_count > 0:
                self.stdout.write('Restaurants:')
                for rest in city.restaurants.all():
                    self.stdout.write(f'  - {rest.name} (ID: {rest.id})')
            
            if total == 0:
                self.stdout.write('❌ NO DESTINATIONS FOUND!')

        # Check for orphaned destinations
        self.stdout.write(f'\n=== CHECKING FOR ASSIGNMENT ISSUES ===')
        
        # Find attractions that might be misassigned
        problem_attractions = []
        for attraction in Attraction.objects.all():
            city_name_in_attraction = attraction.name
            # Check if attraction name suggests it belongs to a different city
            if 'Colosseum' in attraction.name and attraction.city.name != 'Rome':
                problem_attractions.append(f'{attraction.name} should be in Rome, currently in {attraction.city}')
            elif 'Eiffel' in attraction.name and attraction.city.name != 'Paris':
                problem_attractions.append(f'{attraction.name} should be in Paris, currently in {attraction.city}')
            elif 'Tokyo' in attraction.name and attraction.city.name != 'Tokyo':
                problem_attractions.append(f'{attraction.name} should be in Tokyo, currently in {attraction.city}')
        
        if problem_attractions:
            self.stdout.write('\n⚠️  POTENTIAL ASSIGNMENT ISSUES:')
            for issue in problem_attractions:
                self.stdout.write(f'  - {issue}')
        else:
            self.stdout.write('\n✅ No obvious assignment issues found')

        self.stdout.write(f'\n=== SUMMARY ===')
        total_cities = City.objects.count()
        cities_with_destinations = City.objects.filter(
            models.Q(attractions__isnull=False) |
            models.Q(hotels__isnull=False) |
            models.Q(restaurants__isnull=False)
        ).distinct().count()
        
        self.stdout.write(f'Total cities: {total_cities}')
        self.stdout.write(f'Cities with destinations: {cities_with_destinations}')
        self.stdout.write(f'Cities without destinations: {total_cities - cities_with_destinations}')