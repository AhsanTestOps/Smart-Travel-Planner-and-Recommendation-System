from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import City, Category, Attraction, Hotel, Restaurant
from .serializers import (
    CitySerializer, CityDetailSerializer, CategorySerializer,
    AttractionSerializer, HotelSerializer, RestaurantSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cities(request):
    """Get all active cities"""
    try:
        cities = City.objects.filter(is_active=True)
        
        # Optional country filter
        country = request.GET.get('country')
        if country:
            cities = cities.filter(country__icontains=country)
        
        # Optional search
        search = request.GET.get('search')
        if search:
            cities = cities.filter(
                Q(name__icontains=search) | Q(country__icontains=search)
            )
        
        serializer = CityDetailSerializer(cities, many=True)
        return Response({
            'success': True,
            'cities': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """Get all categories"""
    try:
        categories = Category.objects.all()
        
        # Optional type filter
        category_type = request.GET.get('type')
        if category_type:
            categories = categories.filter(type=category_type)
        
        serializer = CategorySerializer(categories, many=True)
        return Response({
            'success': True,
            'categories': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_attractions(request):
    """Get attractions with filtering"""
    try:
        attractions = Attraction.objects.filter(is_active=True).select_related('city', 'category')
        
        # Filter by city
        city_id = request.GET.get('city_id')
        if city_id:
            attractions = attractions.filter(city_id=city_id)
        
        # Filter by category
        category_id = request.GET.get('category_id')
        if category_id:
            attractions = attractions.filter(category_id=category_id)
        
        # Filter by rating
        min_rating = request.GET.get('min_rating')
        if min_rating:
            try:
                min_rating = float(min_rating)
                attractions = attractions.filter(rating__gte=min_rating)
            except ValueError:
                pass
        
        # Search
        search = request.GET.get('search')
        if search:
            attractions = attractions.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(city__name__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get('order_by', '-rating')
        if ordering in ['name', '-name', 'rating', '-rating']:
            attractions = attractions.order_by(ordering)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = attractions.count()
        attractions_page = attractions[start:end]
        
        serializer = AttractionSerializer(attractions_page, many=True)
        return Response({
            'success': True,
            'attractions': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_hotels(request):
    """Get hotels with filtering"""
    try:
        hotels = Hotel.objects.filter(is_active=True).select_related('city', 'category')
        
        # Filter by city
        city_id = request.GET.get('city_id')
        if city_id:
            hotels = hotels.filter(city_id=city_id)
        
        # Filter by category
        category_id = request.GET.get('category_id')
        if category_id:
            hotels = hotels.filter(category_id=category_id)
        
        # Filter by price range
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price:
            try:
                hotels = hotels.filter(price_per_night__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                hotels = hotels.filter(price_per_night__lte=float(max_price))
            except ValueError:
                pass
        
        # Filter by rating
        min_rating = request.GET.get('min_rating')
        if min_rating:
            try:
                hotels = hotels.filter(rating__gte=float(min_rating))
            except ValueError:
                pass
        
        # Search
        search = request.GET.get('search')
        if search:
            hotels = hotels.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(city__name__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get('order_by', '-rating')
        if ordering in ['name', '-name', 'rating', '-rating', 'price_per_night', '-price_per_night']:
            hotels = hotels.order_by(ordering)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = hotels.count()
        hotels_page = hotels[start:end]
        
        serializer = HotelSerializer(hotels_page, many=True)
        return Response({
            'success': True,
            'hotels': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_restaurants(request):
    """Get restaurants with filtering"""
    try:
        restaurants = Restaurant.objects.filter(is_active=True).select_related('city', 'category')
        
        # Filter by city
        city_id = request.GET.get('city_id')
        if city_id:
            restaurants = restaurants.filter(city_id=city_id)
        
        # Filter by category
        category_id = request.GET.get('category_id')
        if category_id:
            restaurants = restaurants.filter(category_id=category_id)
        
        # Filter by cuisine
        cuisine = request.GET.get('cuisine')
        if cuisine:
            restaurants = restaurants.filter(cuisine__icontains=cuisine)
        
        # Filter by price level
        price_level = request.GET.get('price_level')
        if price_level:
            restaurants = restaurants.filter(price_level=price_level)
        
        # Filter by rating
        min_rating = request.GET.get('min_rating')
        if min_rating:
            try:
                restaurants = restaurants.filter(rating__gte=float(min_rating))
            except ValueError:
                pass
        
        # Search
        search = request.GET.get('search')
        if search:
            restaurants = restaurants.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(cuisine__icontains=search) |
                Q(city__name__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get('order_by', '-rating')
        if ordering in ['name', '-name', 'rating', '-rating']:
            restaurants = restaurants.order_by(ordering)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = restaurants.count()
        restaurants_page = restaurants[start:end]
        
        serializer = RestaurantSerializer(restaurants_page, many=True)
        return Response({
            'success': True,
            'restaurants': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)