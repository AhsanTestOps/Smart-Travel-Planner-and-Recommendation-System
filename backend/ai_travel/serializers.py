from rest_framework import serializers
from .models import AIItinerary, BudgetEstimate, AIGenerationLog
from datetime import datetime

class AIItineraryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AI itineraries"""
    
    class Meta:
        model = AIItinerary
        fields = [
            'destination', 'start_date', 'end_date', 'duration_days',
            'adults', 'children', 'budget', 'budget_amount', 'currency',
            'travel_style', 'interests', 'accommodation_preference',
            'transportation_preference', 'session_id', 'user',
            'itinerary_content', 'budget_breakdown', 'recommendations',
            'generation_time', 'ai_model_used'
        ]
    
    def validate(self, data):
        """Validate the input data"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        
        # Calculate duration if not provided
        if 'duration_days' not in data or not data['duration_days']:
            duration = (data['end_date'] - data['start_date']).days
            data['duration_days'] = max(1, duration)
        
        return data

class BudgetEstimateSerializer(serializers.ModelSerializer):
    """Serializer for budget estimates"""
    
    class Meta:
        model = BudgetEstimate
        fields = '__all__'

class AIItinerarySerializer(serializers.ModelSerializer):
    """Serializer for retrieving AI itineraries"""
    detailed_budget = BudgetEstimateSerializer(read_only=True)
    is_anonymous = serializers.ReadOnlyField()
    total_travelers = serializers.ReadOnlyField()
    
    class Meta:
        model = AIItinerary
        fields = '__all__'

class AIItineraryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing itineraries"""
    is_anonymous = serializers.ReadOnlyField()
    total_travelers = serializers.ReadOnlyField()
    
    class Meta:
        model = AIItinerary
        fields = [
            'id', 'destination', 'start_date', 'end_date', 'duration_days',
            'adults', 'children', 'budget', 'budget_amount', 'travel_style', 
            'interests', 'itinerary_content', 'budget_breakdown', 'created_at',
            'is_anonymous', 'total_travelers'
        ]

class AIGenerationLogSerializer(serializers.ModelSerializer):
    """Serializer for AI generation logs"""
    
    class Meta:
        model = AIGenerationLog
        fields = '__all__'

class ItineraryRequestSerializer(serializers.Serializer):
    """Serializer for itinerary generation requests"""
    destination = serializers.CharField(max_length=200)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    duration_days = serializers.IntegerField(min_value=1, required=False)
    adults = serializers.IntegerField(min_value=1, default=1)
    children = serializers.IntegerField(min_value=0, default=0)
    group_size = serializers.IntegerField(min_value=1, required=False)  # Add group_size support
    budget = serializers.ChoiceField(
        choices=['budget', 'mid-range', 'luxury'],
        default='mid-range'
    )
    budget_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    currency = serializers.CharField(max_length=3, default='USD')
    travel_style = serializers.ChoiceField(
        choices=['cultural', 'adventure', 'relaxation', 'family', 'romantic', 'solo', 'business'],
        default='cultural'
    )
    interests = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False, 
        allow_empty=True,
        default=list
    )
    special_requirements = serializers.CharField(required=False, allow_blank=True)
    accommodation_preference = serializers.CharField(required=False, allow_blank=True)
    transportation_preference = serializers.CharField(required=False, allow_blank=True)
    session_id = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate the request data"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        
        # Calculate duration if not provided
        if 'duration_days' not in data or not data['duration_days']:
            duration = (data['end_date'] - data['start_date']).days
            data['duration_days'] = max(1, duration)
        
        # Handle group_size vs adults compatibility
        if 'group_size' in data and data['group_size']:
            data['adults'] = data['group_size']
        elif 'adults' in data:
            data['group_size'] = data['adults']
        else:
            data['adults'] = 1
            data['group_size'] = 1
        
        return data

class BudgetRequestSerializer(serializers.Serializer):
    """Serializer for budget estimation requests"""
    itinerary_id = serializers.UUIDField()
    include_alternatives = serializers.BooleanField(default=True)
    detailed_breakdown = serializers.BooleanField(default=True)
