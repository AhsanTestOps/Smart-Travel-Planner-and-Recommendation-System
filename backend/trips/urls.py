from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_trip, name='create_trip'),
    path('', views.get_user_trips, name='get_user_trips'),
    path('<int:trip_id>/', views.get_trip_detail, name='get_trip_detail'),
]
