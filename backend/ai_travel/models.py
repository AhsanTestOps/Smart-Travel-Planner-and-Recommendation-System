from django.db import models
from django.contrib.auth.models import User
import uuid

class AIItinerary(models.Model):
    """Model for storing AI-generated travel itineraries"""
    BUDGET_CHOICES = [
        ('budget', 'Budget'),
        ('mid-range', 'Mid-range'),
        ('luxury', 'Luxury'),
    ]
    
    TRAVEL_STYLE_CHOICES = [
        ('cultural', 'Cultural'),
        ('adventure', 'Adventure'),
        ('relaxation', 'Relaxation'),
        ('family', 'Family'),
        ('romantic', 'Romantic'),
        ('solo', 'Solo'),
        ('business', 'Business'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Trip Details
    destination = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.IntegerField()
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    
    # Preferences
    budget = models.CharField(max_length=20, choices=BUDGET_CHOICES, default='mid-range')
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    travel_style = models.CharField(max_length=20, choices=TRAVEL_STYLE_CHOICES, default='cultural')
    interests = models.TextField(help_text="Comma-separated interests")
    accommodation_preference = models.CharField(max_length=100, blank=True)
    transportation_preference = models.CharField(max_length=100, blank=True)
    
    # AI Generated Content
    itinerary_content = models.JSONField(help_text="AI-generated itinerary in JSON format")
    budget_breakdown = models.JSONField(help_text="AI-generated budget breakdown")
    recommendations = models.JSONField(default=list, help_text="Additional recommendations")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ai_model_used = models.CharField(max_length=50, default='simple-ai')
    generation_time = models.FloatField(null=True, blank=True, help_text="Time taken to generate in seconds")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "AI Itinerary"
        verbose_name_plural = "AI Itineraries"
        
    def __str__(self):
        return f"AI Itinerary for {self.destination} ({self.duration_days} days)"
    
    @property
    def is_anonymous(self):
        return self.user is None
        
    @property
    def total_travelers(self):
        return self.adults + self.children

class BudgetEstimate(models.Model):
    """Model for storing detailed budget estimates"""
    itinerary = models.OneToOneField(AIItinerary, on_delete=models.CASCADE, related_name='detailed_budget')
    
    # Accommodation
    accommodation_min = models.DecimalField(max_digits=10, decimal_places=2)
    accommodation_max = models.DecimalField(max_digits=10, decimal_places=2)
    accommodation_recommendations = models.JSONField(default=list)
    
    # Transportation
    transportation_min = models.DecimalField(max_digits=10, decimal_places=2)
    transportation_max = models.DecimalField(max_digits=10, decimal_places=2)
    transportation_breakdown = models.JSONField(default=dict)
    
    # Food & Dining
    food_min = models.DecimalField(max_digits=10, decimal_places=2)
    food_max = models.DecimalField(max_digits=10, decimal_places=2)
    dining_recommendations = models.JSONField(default=list)
    
    # Activities & Entertainment
    activities_min = models.DecimalField(max_digits=10, decimal_places=2)
    activities_max = models.DecimalField(max_digits=10, decimal_places=2)
    activities_breakdown = models.JSONField(default=list)
    
    # Shopping & Miscellaneous
    shopping_min = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shopping_max = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    miscellaneous = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Emergency Fund
    emergency_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Totals
    total_min = models.DecimalField(max_digits=10, decimal_places=2)
    total_max = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Alternative options
    budget_alternatives = models.JSONField(default=list, help_text="Budget-friendly alternatives")
    luxury_alternatives = models.JSONField(default=list, help_text="Luxury alternatives")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Budget Estimate"
        verbose_name_plural = "Budget Estimates"
        
    def __str__(self):
        return f"Budget for {self.itinerary.destination} ({self.total_min}-{self.total_max} {self.itinerary.currency})"

class AIGenerationLog(models.Model):
    """Model for tracking AI API usage and performance"""
    itinerary = models.ForeignKey(AIItinerary, on_delete=models.CASCADE, related_name='generation_logs')
    
    request_type = models.CharField(max_length=50, choices=[
        ('itinerary', 'Itinerary Generation'),
        ('budget', 'Budget Estimation'),
        ('recommendations', 'Recommendations'),
    ])
    
    prompt_sent = models.TextField()
    response_received = models.TextField()
    tokens_used = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(help_text="Response time in seconds")
    
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "AI Generation Log"
        verbose_name_plural = "AI Generation Logs"
        
    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.request_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
