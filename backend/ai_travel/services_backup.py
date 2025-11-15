"""
AI Service for travel itinerary generation using DeepSeek via OpenRouter
"""

import os
import json
import time
import logging
import requests
from django.conf import settings
from typing import Dict, Any, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AIService:
    """Enhanced AI service for generating detailed travel itineraries"""
    
    def __init__(self):
        print("🚀🚀🚀 FINALLY! NEW SERVICES.PY LOADED! 🚀🚀🚀")
        
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model_name = "deepseek/deepseek-chat"
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not configured in Django settings")
    
    def generate_itinerary(self, trip_data: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
        """Generate comprehensive Dubai-style travel itinerary"""
        print("🎯🎯🎯 ENHANCED generate_itinerary called! 🎯🎯🎯")
        print(f"🎯 Trip data received: {trip_data}")
        
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        
        # Return the comprehensive Dubai-style itinerary structure
        sample_itinerary = {
            "itinerary_content": {
                "overview": f"Experience the very best of {destination} with this comprehensive {duration_days}-day itinerary designed specifically for your adventure travel style. This carefully crafted journey takes you from world-famous landmarks to hidden local treasures, offering the perfect blend of must-see attractions and authentic cultural experiences. Each day is thoughtfully designed to showcase {destination}'s unique character, rich history, vibrant culture, and distinctive atmosphere that makes it one of the world's premier destinations.",
                
                "total_estimated_cost": 12000,
                
                "daily_schedule": [
                    {
                        "day": 1,
                        "date": "2025-09-13", 
                        "title": f"Day 1: Arrival and {destination} Marina Adventures",
                        "theme": "High-octane arrival with spectacular views",
                        "activities": [
                            {
                                "time": "Morning (10:00 AM)",
                                "activity": f"{destination} XLine Zipline Adventure",
                                "description": f"Start your {destination} adventure with an adrenaline rush! Experience one of the world's longest and fastest urban ziplines, soaring over the stunning marina at speeds up to 80 km/h. This 1-kilometer journey offers breathtaking views of the coastline, luxury yachts, and towering skyscrapers.",
                                "location": f"{destination} Marina District",
                                "type": "adventure",
                                "estimated_cost": 190,
                                "duration": "2 hours",
                                "tips": "Book online for discounts, arrive early to avoid crowds, bring comfortable clothes"
                            },
                            {
                                "time": "Afternoon (2:00 PM)",
                                "activity": f"Luxury Marina Lunch & Jet Ski Experience", 
                                "description": f"Enjoy a lavish lunch at one of {destination}'s premium restaurants with panoramic water views, followed by an exhilarating jet ski session around the coastline. Feel the thrill of speeding across the azure waters while admiring the iconic skyline.",
                                "location": f"{destination} Marina & Coastline",
                                "type": "adventure",
                                "estimated_cost": 300,
                                "duration": "4 hours",
                                "tips": "Waterproof camera recommended, sun protection essential, follow safety guidelines"
                            }
                        ],
                        "dining_recommendations": [
                            f"Marina View Restaurant: Stunning {destination} marina views with international cuisine, perfect for sunset dining",
                            f"Waterfront Café: Beach club with premium dining and direct water access"
                        ],
                        "daily_cost_estimate": 490
                    }
                ],
                
                "recommendations": {
                    "restaurants": [
                        f"{destination} Skyview Bar: Ultra-luxury dining with panoramic city views and premium interiors",
                        f"Local Culinary House: Authentic {destination} cuisine with celebrity chef pedigree"
                    ],
                    "activities": [
                        f"Coastal Skydiving: Ultimate adrenaline experience with professional instructors and ocean views",
                        f"Desert Safari Adventure: Traditional local experience with cultural immersion and authentic dinner"
                    ],
                    "cultural_tips": [
                        "Dress modestly when visiting cultural or religious sites - cover shoulders and knees",
                        "Learn basic local greetings to show respect and connect with residents"
                    ]
                },
                
                "images": []
            }
        }
        
        print(f"🎯 Returning Dubai-style enhanced itinerary for {destination}")
        return sample_itinerary, 2.0
    
    def generate_budget_estimate(self, trip_data: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
        """Generate detailed budget estimate for the trip"""
        print("💰 Generating comprehensive budget estimate...")
        
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        
        budget_estimate = {
            "accommodation": {
                "budget_min": 50 * duration_days,
                "budget_max": 200 * duration_days,
                "recommendations": [f"Budget Hotel in {destination}", f"Luxury Resort in {destination}"]
            },
            "transportation": {
                "local": {"daily_transport": 30},
                "total": 30 * duration_days
            },
            "food": {
                "budget_daily": 40, 
                "luxury_daily": 150,
                "dining_recommendations": [f"Must-try {destination} restaurant", f"Local street food tour"]
            },
            "activities": {
                "daily_activity_budget": 100, 
                "must_see_attractions": [f"Top {destination} attraction", f"Hidden {destination} gem"]
            },
            "shopping": {"souvenirs": 150},
            "miscellaneous": {"emergency_fund": 300},
            "total_estimates": {
                "budget_total": (50 + 30 + 40 + 100) * duration_days + 150 + 300,
                "luxury_total": (200 + 30 + 150 + 150) * duration_days + 300 + 300
            }
        }
        
        return budget_estimate, 1.5
