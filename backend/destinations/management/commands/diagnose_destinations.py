from django.core.management.base import BaseCommand
from destinations.models import City, Attraction, Hotel, Restaurant
import json

class Command(BaseCommand):
    help = 'Create a comprehensive diagnostic report for destinations API'

    def handle(self, *args, **options):
        self.stdout.write('=== DESTINATION DIAGNOSTIC REPORT ===\n')

        # 1. Check all cities and their destinations
        self.stdout.write('1. CITIES AND THEIR DESTINATIONS:')
        for city in City.objects.all().order_by('name'):
            attractions = city.attractions.filter(is_active=True).count()
            hotels = city.hotels.filter(is_active=True).count()
            restaurants = city.restaurants.filter(is_active=True).count()
            total = attractions + hotels + restaurants
            
            status = "✅" if total > 0 else "❌"
            self.stdout.write(f'{status} {city.name}, {city.country} (ID:{city.id}) - Total: {total} (A:{attractions} H:{hotels} R:{restaurants})')

        # 2. Simulate API calls
        self.stdout.write('\n2. API SIMULATION TEST:')
        
        rome = City.objects.get(name='Rome', country='Italy')
        
        # Test attractions API call simulation
        attractions_queryset = Attraction.objects.filter(is_active=True, city_id=rome.id).select_related('city', 'category')
        attractions_count = attractions_queryset.count()
        
        self.stdout.write(f'Rome attractions query result: {attractions_count} items')
        for attraction in attractions_queryset:
            self.stdout.write(f'  - {attraction.name} (Active: {attraction.is_active}, Category: {attraction.category})')

        # Test hotels
        hotels_queryset = Hotel.objects.filter(is_active=True, city_id=rome.id).select_related('city', 'category')
        hotels_count = hotels_queryset.count()
        self.stdout.write(f'Rome hotels query result: {hotels_count} items')
        for hotel in hotels_queryset:
            self.stdout.write(f'  - {hotel.name}')

        # Test restaurants  
        restaurants_queryset = Restaurant.objects.filter(is_active=True, city_id=rome.id).select_related('city', 'category')
        restaurants_count = restaurants_queryset.count()
        self.stdout.write(f'Rome restaurants query result: {restaurants_count} items')
        for restaurant in restaurants_queryset:
            self.stdout.write(f'  - {restaurant.name}')

        # 3. Check for common issues
        self.stdout.write('\n3. COMMON ISSUES CHECK:')
        
        # Check if any destinations are inactive
        inactive_attractions = Attraction.objects.filter(is_active=False).count()
        inactive_hotels = Hotel.objects.filter(is_active=False).count()
        inactive_restaurants = Restaurant.objects.filter(is_active=False).count()
        
        self.stdout.write(f'Inactive attractions: {inactive_attractions}')
        self.stdout.write(f'Inactive hotels: {inactive_hotels}')
        self.stdout.write(f'Inactive restaurants: {inactive_restaurants}')

        # Check for missing categories
        attractions_no_category = Attraction.objects.filter(category__isnull=True).count()
        hotels_no_category = Hotel.objects.filter(category__isnull=True).count()
        restaurants_no_category = Restaurant.objects.filter(category__isnull=True).count()
        
        self.stdout.write(f'Attractions without category: {attractions_no_category}')
        self.stdout.write(f'Hotels without category: {hotels_no_category}')
        self.stdout.write(f'Restaurants without category: {restaurants_no_category}')

        # 4. Generate sample API responses
        self.stdout.write('\n4. SAMPLE API RESPONSE FORMAT:')
        
        # Generate what the API should return for Rome attractions
        from destinations.serializers import AttractionSerializer
        rome_attractions = Attraction.objects.filter(is_active=True, city_id=rome.id).select_related('city', 'category')
        serializer = AttractionSerializer(rome_attractions, many=True)
        
        api_response = {
            'success': True,
            'attractions': serializer.data,
            'pagination': {
                'page': 1,
                'page_size': 20,
                'total_count': rome_attractions.count(),
                'total_pages': 1
            }
        }
        
        self.stdout.write('Expected API response for Rome attractions:')
        self.stdout.write(json.dumps(api_response, indent=2)[:500] + '...' if len(str(api_response)) > 500 else json.dumps(api_response, indent=2))

        self.stdout.write(self.style.SUCCESS('\n✅ Diagnostic complete!'))