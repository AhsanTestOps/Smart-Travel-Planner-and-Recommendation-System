from django.urls import path
from . import views

urlpatterns = [
    # Cities
    path('cities/', views.get_cities, name='get_cities'),
    
    # Categories
    path('categories/', views.get_categories, name='get_categories'),
    
    # Attractions
    path('attractions/', views.get_attractions, name='get_attractions'),
    
    # Hotels
    path('hotels/', views.get_hotels, name='get_hotels'),
    
    # Restaurants
    path('restaurants/', views.get_restaurants, name='get_restaurants'),
]