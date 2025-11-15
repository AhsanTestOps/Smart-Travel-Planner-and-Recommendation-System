from rest_framework import serializers
from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['id', 'destination', 'start_date', 'end_date', 'travelers', 'interests', 'budget_per_person', 'itinerary', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
