from rest_framework import serializers
from .models import FreeTrip
from datetime import datetime, date

class FreeTripSerializer(serializers.ModelSerializer):
    duration_days = serializers.ReadOnlyField()
    
    class Meta:
        model = FreeTrip
        fields = [
            'id',
            'destination',
            'start_date',
            'end_date',
            'budget',
            'currency',
            'adults',
            'children',
            'accommodation_type',
            'transportation_mode',
            'interests',
            'description',
            'contact_email',
            'contact_name',
            'itinerary',
            'created_at',
            'updated_at',
            'is_active',
            'session_id',
            'duration_days',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_days']
    
    def validate_start_date(self, value):
        """
        Validate start date - allow today or future dates
        """
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD format.")
        
        today = date.today()
        if value < today:
            raise serializers.ValidationError(f"Start date cannot be in the past. Today is {today.strftime('%Y-%m-%d')}")
        
        return value
    
    def validate_end_date(self, value):
        """
        Validate end date format
        """
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Invalid date format. Use YYYY-MM-DD format.")
        
        return value
    
    def validate(self, data):
        """
        Cross-field validation for dates
        """
        try:
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            
            if start_date and end_date:
                # Convert to date objects if they're strings
                if isinstance(start_date, str):
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                
                if isinstance(end_date, str):
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                
                # Check that end date is after start date
                if end_date <= start_date:
                    raise serializers.ValidationError({
                        "end_date": "End date must be after start date."
                    })
                
                # Store the converted dates back to data
                data['start_date'] = start_date
                data['end_date'] = end_date
                
        except (ValueError, TypeError) as e:
            raise serializers.ValidationError(f"Date validation error: {str(e)}")
        
        return data
