from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Check which categories have no destinations assigned'

    def handle(self, *args, **options):
        self.stdout.write('Checking categories for missing content...')

        all_categories = Category.objects.all()
        
        self.stdout.write(f'\n=== CATEGORY CONTENT STATUS ===')
        
        empty_categories = []
        
        for category in all_categories:
            attraction_count = category.attractions.count()
            hotel_count = category.hotels.count()  
            restaurant_count = category.restaurants.count()
            total_count = attraction_count + hotel_count + restaurant_count
            
            status = "✅" if total_count > 0 else "❌"
            self.stdout.write(f'{status} {category.name}: {total_count} items (A:{attraction_count}, H:{hotel_count}, R:{restaurant_count})')
            
            if total_count == 0:
                empty_categories.append(category)
        
        self.stdout.write(f'\n=== SUMMARY ===')
        self.stdout.write(f'Total categories: {all_categories.count()}')
        self.stdout.write(f'Categories with content: {all_categories.count() - len(empty_categories)}')
        self.stdout.write(f'Empty categories: {len(empty_categories)}')
        
        if empty_categories:
            self.stdout.write(f'\n=== EMPTY CATEGORIES ===')
            for cat in empty_categories:
                self.stdout.write(f'- {cat.name} ({cat.type})')
        else:
            self.stdout.write(self.style.SUCCESS('\n🎉 All categories have content!'))