from django.urls import path
from . import views

urlpatterns = [
    # AI Itinerary Generation
    path('generate/', views.generate_ai_itinerary, name='generate_ai_itinerary'),
    path('itinerary/<uuid:itinerary_id>/', views.get_ai_itinerary, name='get_ai_itinerary'),
    path('itinerary/<uuid:itinerary_id>/delete/', views.delete_ai_itinerary, name='delete_ai_itinerary'),
    
    # User Itineraries
    path('my-itineraries/', views.list_user_itineraries, name='list_user_itineraries'),
    
    # Session Itineraries (for anonymous users)
    path('session/<str:session_id>/', views.list_session_itineraries, name='list_session_itineraries'),
    
    # Budget Estimation
    path('budget/regenerate/', views.regenerate_budget, name='regenerate_budget'),
]
