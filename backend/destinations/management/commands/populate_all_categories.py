from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Populate all categories with comprehensive destinations'

    def handle(self, *args, **options):
        self.stdout.write('Populating all categories with destinations...')

        # Get all cities and categories
        cities = City.objects.all()
        categories = {cat.name: cat for cat in Category.objects.all()}

        # Historic Sites - Add to all major cities
        historic_sites = [
            # Paris
            {"city": "Paris", "name": "Notre-Dame Cathedral", "description": "Gothic cathedral masterpiece with stunning architecture and rich history.", "rating": 4.5, "address": "6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris", "image_url": "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop&crop=center"},
            {"city": "Paris", "name": "Arc de Triomphe", "description": "Iconic triumphal arch honoring French military victories.", "rating": 4.4, "address": "Place Charles de Gaulle, 75008 Paris", "image_url": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center"},
            {"city": "Paris", "name": "Sacré-Cœur Basilica", "description": "Beautiful basilica atop Montmartre with panoramic city views.", "rating": 4.3, "address": "35 Rue du Chevalier de la Barre, 75018 Paris", "image_url": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center"},
            
            # London
            {"city": "London", "name": "Westminster Abbey", "description": "Historic abbey where British monarchs are crowned and buried.", "rating": 4.6, "address": "20 Deans Yd, London SW1P 3PA", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Buckingham Palace", "description": "Official residence of the British monarch.", "rating": 4.2, "address": "London SW1A 1AA", "image_url": "https://images.unsplash.com/photo-1529655683826-f897b3b9c5bb?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "St. Paul's Cathedral", "description": "Baroque architectural masterpiece with famous dome.", "rating": 4.5, "address": "St. Paul's Churchyard, London EC4M 8AD", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center"},
            
            # Tokyo
            {"city": "Tokyo", "name": "Senso-ji Temple", "description": "Ancient Buddhist temple and Tokyo's oldest temple.", "rating": 4.3, "address": "2 Chome-3-1 Asakusa, Taito City, Tokyo", "image_url": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Imperial Palace East Gardens", "description": "Historic gardens of the former Edo Castle.", "rating": 4.2, "address": "1-1 Chiyoda, Tokyo", "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=center"},
            
            # New York
            {"city": "New York", "name": "Statue of Liberty", "description": "Iconic symbol of freedom and democracy.", "rating": 4.7, "address": "Liberty Island, New York, NY", "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Ellis Island", "description": "Historic immigration station and museum.", "rating": 4.5, "address": "Ellis Island, New York, NY", "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop&crop=center"},
        ]

        # Museums
        museums = [
            {"city": "Paris", "name": "Musée d'Orsay", "description": "World's finest collection of Impressionist art.", "rating": 4.6, "address": "1 Rue de la Légion d'Honneur, 75007 Paris", "image_url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Tate Modern", "description": "Contemporary art museum in former power station.", "rating": 4.4, "address": "Bankside, London SE1 9TG", "image_url": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Museum of Modern Art", "description": "World-renowned modern and contemporary art museum.", "rating": 4.5, "address": "11 W 53rd St, New York, NY", "image_url": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "National Museum", "description": "Japan's premier museum of art and antiquities.", "rating": 4.3, "address": "13-9 Uenokoen, Taito City, Tokyo", "image_url": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop&crop=center"},
        ]

        # Parks & Gardens
        parks = [
            {"city": "Paris", "name": "Luxembourg Gardens", "description": "Beautiful palace gardens perfect for strolling.", "rating": 4.5, "address": "75006 Paris", "image_url": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Hyde Park", "description": "Large royal park with Speaker's Corner and Serpentine Lake.", "rating": 4.4, "address": "London", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Central Park", "description": "Iconic urban park in the heart of Manhattan.", "rating": 4.7, "address": "New York, NY", "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Shinjuku Gyoen", "description": "Large park blending Japanese, English and French garden styles.", "rating": 4.4, "address": "11 Naito-machi, Shinjuku, Tokyo", "image_url": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=center"},
            {"city": "Dubai", "name": "Dubai Miracle Garden", "description": "World's largest flower garden with stunning displays.", "rating": 4.3, "address": "Al Barsha South 3, Dubai", "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center"},
        ]

        # Adventure Sports
        adventure = [
            {"city": "Dubai", "name": "Skydiving Dubai", "description": "Tandem skydiving with views of Palm Jumeirah.", "rating": 4.8, "address": "Dubai Marina", "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Brooklyn Bridge Climbing", "description": "Guided climbing tours of the iconic bridge.", "rating": 4.5, "address": "Brooklyn Bridge, New York", "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop&crop=center"},
            {"city": "Sydney", "name": "Harbour Bridge Climb", "description": "Climb to the top of Sydney's iconic bridge.", "rating": 4.7, "address": "Sydney Harbour Bridge", "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center"},
        ]

        # Luxury Hotels
        luxury_hotels = [
            {"city": "Paris", "name": "Hotel Plaza Athénée", "description": "Luxury palace hotel on Avenue Montaigne.", "rating": 4.8, "price_per_night": 800.00, "address": "25 Avenue Montaigne, 75008 Paris", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "The Savoy", "description": "Legendary luxury hotel overlooking the Thames.", "rating": 4.7, "price_per_night": 600.00, "address": "Strand, London WC2R 0EZ", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "Dubai", "name": "Atlantis The Palm", "description": "Iconic resort on Palm Jumeirah with water park.", "rating": 4.4, "price_per_night": 400.00, "address": "Palm Jumeirah, Dubai", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Park Hyatt Tokyo", "description": "Luxury hotel with views of Mount Fuji.", "rating": 4.6, "price_per_night": 500.00, "address": "3-7-1-2 Nishi Shinjuku, Tokyo", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
        ]

        # Budget Hotels
        budget_hotels = [
            {"city": "Paris", "name": "Hotel des Arts Montmartre", "description": "Cozy budget hotel in artistic Montmartre.", "rating": 4.0, "price_per_night": 80.00, "address": "5 Rue Tholozé, 75018 Paris", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Premier Inn London", "description": "Reliable budget accommodation across London.", "rating": 4.1, "price_per_night": 90.00, "address": "Various locations, London", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Capsule Hotel Shinjuku", "description": "Modern capsule hotel experience in Shinjuku.", "rating": 3.9, "price_per_night": 40.00, "address": "Shinjuku, Tokyo", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Pod Hotels", "description": "Stylish micro-rooms at affordable prices.", "rating": 4.0, "price_per_night": 120.00, "address": "Various locations, NYC", "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&crop=center"},
        ]

        # Fine Dining
        fine_dining = [
            {"city": "Paris", "name": "Le Meurice", "description": "Michelin-starred restaurant by Alain Ducasse.", "rating": 4.7, "price_level": "$$$$", "address": "228 Rue de Rivoli, 75001 Paris", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Gordon Ramsay", "description": "Three Michelin-starred restaurant in Chelsea.", "rating": 4.6, "price_level": "$$$$", "address": "68 Royal Hospital Rd, London SW3 4HP", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Sukiyabashi Jiro", "description": "World-famous sushi restaurant of Jiro Ono.", "rating": 4.8, "price_level": "$$$$", "address": "Tsukamoto Sogyo Building B1F, 4-2-15 Ginza", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
            {"city": "New York", "name": "Le Bernardin", "description": "Renowned seafood restaurant with three Michelin stars.", "rating": 4.6, "price_level": "$$$$", "address": "155 W 51st St, New York, NY", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
        ]

        # Street Food
        street_food = [
            {"city": "Tokyo", "name": "Tsukiji Outer Market", "description": "Fresh sushi and street food in historic market.", "rating": 4.4, "price_level": "$", "address": "5-2-1 Tsukiji, Chuo City, Tokyo", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
            {"city": "Dubai", "name": "Al Dhiyafah Road", "description": "Traditional Emirati street food and shawarma.", "rating": 4.2, "price_level": "$", "address": "Al Dhiyafah Rd, Dubai", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "Borough Market", "description": "Historic market with diverse street food options.", "rating": 4.3, "price_level": "$$", "address": "8 Southwark St, London SE1 1TL", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center"},
        ]

        # Modern Architecture
        modern_arch = [
            {"city": "Dubai", "name": "Museum of the Future", "description": "Innovative museum showcasing future technologies.", "rating": 4.5, "address": "Trade Centre - Dubai", "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "The Shard", "description": "Iconic 95-story skyscraper with observation deck.", "rating": 4.3, "address": "32 London Bridge St, London SE1 9SG", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center"},
            {"city": "Sydney", "name": "Sydney Opera House", "description": "Iconic performing arts venue with distinctive design.", "rating": 4.6, "address": "Bennelong Point, Sydney NSW", "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center"},
        ]

        # Scenic Views
        scenic_views = [
            {"city": "Paris", "name": "Montparnasse Tower", "description": "Best panoramic views of Paris skyline.", "rating": 4.2, "address": "33 Avenue du Maine, 75015 Paris", "image_url": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center"},
            {"city": "London", "name": "London Eye", "description": "Giant observation wheel with Thames views.", "rating": 4.1, "address": "Riverside Building, County Hall, London SE1 7PB", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=center"},
            {"city": "Tokyo", "name": "Tokyo Skytree", "description": "World's second tallest structure with city views.", "rating": 4.3, "address": "1-1-2 Oshiage, Sumida City, Tokyo", "image_url": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=center"},
            {"city": "Sydney", "name": "Sydney Harbour Bridge", "description": "Iconic bridge offering spectacular harbour views.", "rating": 4.5, "address": "Sydney Harbour Bridge, Sydney NSW", "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center"},
        ]

        def create_attractions(attractions_data, category_name):
            if category_name not in categories:
                return
            
            category = categories[category_name]
            for data in attractions_data:
                try:
                    city = City.objects.get(name=data["city"])
                    attraction, created = Attraction.objects.get_or_create(
                        name=data["name"],
                        city=city,
                        defaults={
                            'category': category,
                            'description': data["description"],
                            'rating': data["rating"],
                            'address': data["address"],
                            'image_url': data["image_url"]
                        }
                    )
                    if created:
                        self.stdout.write(f'✓ Created attraction: {attraction.name}')
                except City.DoesNotExist:
                    continue

        def create_hotels(hotels_data, category_name):
            if category_name not in categories:
                return
            
            category = categories[category_name]
            for data in hotels_data:
                try:
                    city = City.objects.get(name=data["city"])
                    hotel, created = Hotel.objects.get_or_create(
                        name=data["name"],
                        city=city,
                        defaults={
                            'category': category,
                            'description': data["description"],
                            'rating': data["rating"],
                            'price_per_night': data["price_per_night"],
                            'address': data["address"],
                            'image_url': data["image_url"]
                        }
                    )
                    if created:
                        self.stdout.write(f'✓ Created hotel: {hotel.name}')
                except City.DoesNotExist:
                    continue

        def create_restaurants(restaurants_data, category_name):
            if category_name not in categories:
                return
            
            category = categories[category_name]
            for data in restaurants_data:
                try:
                    city = City.objects.get(name=data["city"])
                    restaurant, created = Restaurant.objects.get_or_create(
                        name=data["name"],
                        city=city,
                        defaults={
                            'category': category,
                            'description': data["description"],
                            'rating': data["rating"],
                            'price_level': data["price_level"],
                            'address': data["address"],
                            'image_url': data["image_url"]
                        }
                    )
                    if created:
                        self.stdout.write(f'✓ Created restaurant: {restaurant.name}')
                except City.DoesNotExist:
                    continue

        # Create all destinations
        create_attractions(historic_sites, 'Historic Sites')
        create_attractions(museums, 'Museums')
        create_attractions(parks, 'Parks & Gardens')
        create_attractions(adventure, 'Adventure Sports')
        create_attractions(modern_arch, 'Modern Architecture')
        create_attractions(scenic_views, 'Scenic Views')

        create_hotels(luxury_hotels, 'Luxury Hotels')
        create_hotels(budget_hotels, 'Budget Hotels')

        create_restaurants(fine_dining, 'Fine Dining')
        create_restaurants(street_food, 'Street Food')

        # Final count
        self.stdout.write('\n=== FINAL CATEGORY COUNTS ===')
        for cat in Category.objects.all():
            attr_count = Attraction.objects.filter(category=cat).count()
            hotel_count = Hotel.objects.filter(category=cat).count()
            rest_count = Restaurant.objects.filter(category=cat).count()
            if attr_count > 0 or hotel_count > 0 or rest_count > 0:
                self.stdout.write(f'{cat.name}: {attr_count} attractions, {hotel_count} hotels, {rest_count} restaurants')

        self.stdout.write(self.style.SUCCESS('Successfully populated all categories!'))