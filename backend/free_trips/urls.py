from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_free_trip, name='create_free_trip'),
    path('session/<str:session_id>/', views.get_free_trips_by_session, name='get_free_trips_by_session'),
    path('all/', views.get_all_free_trips, name='get_all_free_trips'),
    path('<int:trip_id>/', views.get_free_trip_detail, name='get_free_trip_detail'),
    path('<int:trip_id>/update/', views.update_free_trip, name='update_free_trip'),
]
