from django.core.management.base import BaseCommand
from django.test import Client
import json

class Command(BaseCommand):
    help = 'Test the destinations API endpoints'

    def handle(self, *args, **options):
        self.stdout.write('Testing destinations API endpoints...')
        
        client = Client()
        
        # Test cities endpoint
        response = client.get('/api/destinations/cities/')
        self.stdout.write(f'Cities endpoint status: {response.status_code}')
        if response.status_code == 200:
            data = json.loads(response.content)
            self.stdout.write(f'Cities found: {len(data.get("cities", []))}')
        
        # Test attractions endpoint
        response = client.get('/api/destinations/attractions/')
        self.stdout.write(f'Attractions endpoint status: {response.status_code}')
        if response.status_code == 200:
            data = json.loads(response.content)
            self.stdout.write(f'Total attractions: {len(data.get("attractions", []))}')
        
        # Test Rome attractions specifically (city_id=6)
        response = client.get('/api/destinations/attractions/?city_id=6')
        self.stdout.write(f'Rome attractions endpoint status: {response.status_code}')
        if response.status_code == 200:
            data = json.loads(response.content)
            attractions = data.get('attractions', [])
            self.stdout.write(f'Rome attractions found: {len(attractions)}')
            for attraction in attractions:
                self.stdout.write(f'  - {attraction.get("name")}')
        else:
            self.stdout.write(f'Error response: {response.content.decode()}')

        # Test hotels endpoint for Rome
        response = client.get('/api/destinations/hotels/?city_id=6')
        self.stdout.write(f'Rome hotels endpoint status: {response.status_code}')
        if response.status_code == 200:
            data = json.loads(response.content)
            hotels = data.get('hotels', [])
            self.stdout.write(f'Rome hotels found: {len(hotels)}')
            for hotel in hotels:
                self.stdout.write(f'  - {hotel.get("name")}')

        # Test restaurants endpoint for Rome
        response = client.get('/api/destinations/restaurants/?city_id=6')
        self.stdout.write(f'Rome restaurants endpoint status: {response.status_code}')
        if response.status_code == 200:
            data = json.loads(response.content)
            restaurants = data.get('restaurants', [])
            self.stdout.write(f'Rome restaurants found: {len(restaurants)}')
            for restaurant in restaurants:
                self.stdout.write(f'  - {restaurant.get("name")}')

        self.stdout.write(self.style.SUCCESS('\n✅ API test complete!'))