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
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache

logger = logging.getLogger(__name__)

class AIService:
    """Enhanced AI service for generating detailed travel itineraries"""
    
    # Simple in-memory cache for fast repeated requests
    _cache = {}
    _cache_max_age = 3600  # Cache for 1 hour
    
    # Performance mode: 'fast' uses fallback, 'ai' uses API, 'hybrid' uses AI for recommendations only
    performance_mode = 'hybrid'  # Hybrid mode: fast itinerary + AI recommendations
    
    def __init__(self):
        print("🚀🚀🚀 AI SERVICE INITIALIZED - DEEPSEEK ENABLED! 🚀🚀🚀")
        
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model_name = "deepseek/deepseek-chat"
        
        # ALWAYS use the class-level performance_mode setting (hybrid by default)
        # DO NOT override with environment variable
        print(f"⚡ Performance mode: {self.performance_mode.upper()}")
        print(f"🔑 API Key loaded: {bool(self.api_key)}")
        if self.api_key:
            print(f"🔐 API Key preview: {self.api_key[:15]}...{self.api_key[-10:]}")
        
        if not self.api_key and self.performance_mode in ['ai', 'hybrid']:
            print("❌ WARNING: No API key found but AI mode is enabled!")
            print("❌ AI recommendations will FAIL - set OPENROUTER_API_KEY in settings.py")
        
        if self.api_key and self.performance_mode == 'hybrid':
            print("✅ HYBRID MODE ACTIVE: Fast itinerary + DeepSeek AI recommendations")
        elif self.api_key and self.performance_mode == 'ai':
            print("✅ FULL AI MODE ACTIVE: DeepSeek will generate everything")
    
    def _get_cache_key(self, trip_data: Dict[str, Any]) -> str:
        """Generate cache key from trip data"""
        # Create a simple key from destination and duration
        dest = trip_data.get('destination', '').lower().strip()
        days = trip_data.get('duration_days', 3)
        budget = trip_data.get('budget', 'mid-range')
        style = trip_data.get('travel_style', 'cultural')
        return f"{dest}_{days}d_{budget}_{style}"
    
    def _get_cached_result(self, cache_key: str):
        """Get cached result if available and not expired"""
        if cache_key in self._cache:
            cached_data, timestamp = self._cache[cache_key]
            age = time.time() - timestamp
            if age < self._cache_max_age:
                print(f"⚡ CACHE HIT! Using cached data (age: {age:.0f}s)")
                return cached_data
            else:
                # Remove expired cache
                del self._cache[cache_key]
        return None
    
    def _set_cache(self, cache_key: str, data):
        """Store data in cache"""
        self._cache[cache_key] = (data, time.time())
        print(f"💾 Cached result for: {cache_key}")
    
    def generate_complete_trip(self, trip_data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any], float]:
        """
        Generate both itinerary and budget concurrently for faster performance.
        Uses caching for popular destinations.
        Returns: (itinerary_content, budget_content, total_time)
        """
        print("⚡ FAST MODE: Generating itinerary and budget in parallel...")
        start_time = time.time()
        
        # Check cache first
        cache_key = self._get_cache_key(trip_data)
        cached_result = self._get_cached_result(cache_key)
        if cached_result:
            itinerary_content, budget_content = cached_result
            elapsed = time.time() - start_time
            print(f"⚡ Returned from cache in {elapsed:.3f}s")
            return itinerary_content, budget_content, elapsed
        
        itinerary_result = None
        budget_result = None
        itinerary_time = 0
        budget_time = 0
        
        # Run both API calls concurrently using ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=2) as executor:
            # Submit both tasks
            itinerary_future = executor.submit(self.generate_itinerary, trip_data)
            budget_future = executor.submit(self.generate_budget_estimate, trip_data)
            
            # Wait for both to complete
            for future in as_completed([itinerary_future, budget_future]):
                try:
                    if future == itinerary_future:
                        itinerary_result, itinerary_time = future.result()
                        print(f"✅ Itinerary completed in {itinerary_time:.2f}s")
                    else:
                        budget_result, budget_time = future.result()
                        print(f"✅ Budget completed in {budget_time:.2f}s")
                except Exception as e:
                    print(f"❌ Error in concurrent task: {e}")
                    if future == itinerary_future:
                        itinerary_result = self._create_fallback_detailed_itinerary(trip_data)
                        itinerary_time = 0.5
                    else:
                        budget_result = self._create_fallback_budget(trip_data)
                        budget_time = 0.5
        
        total_time = time.time() - start_time
        time_saved = max(itinerary_time, budget_time) - total_time
        print(f"⚡ Total generation time: {total_time:.2f}s (saved ~{time_saved:.2f}s with parallelization)")
        
        # Cache the results for future requests
        self._set_cache(cache_key, (itinerary_result, budget_result))
        
        return itinerary_result, budget_result, total_time
    
    def generate_itinerary(self, trip_data: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
        """Generate comprehensive detailed travel itinerary using DeepSeek AI"""
        
        # Fast mode: Use high-quality fallback immediately
        if self.performance_mode == 'fast':
            print("⚡ FAST MODE: Using instant fallback with real recommendations")
            start_time = time.time()
            result = self._create_fallback_detailed_itinerary(trip_data)
            elapsed = time.time() - start_time
            return result, elapsed
        
        print("🎯 ENHANCED generate_itinerary called with DeepSeek AI! 🎯")
        print(f"🎯 Trip data received: {trip_data}")
        
        start_time = time.time()
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        budget = trip_data.get('budget', 'mid-range')
        travel_style = trip_data.get('travel_style', 'cultural')
        interests = trip_data.get('interests', [])
        adults = trip_data.get('adults', 2)
        children = trip_data.get('children', 0)
        
        # Create concise but detailed prompt for DeepSeek AI (optimized for speed)
        prompt = f"""Create a {duration_days}-day itinerary for {destination}.

Details: {duration_days} days, ${budget} budget, {travel_style} style, {adults} adults, {children} kids, Interests: {', '.join(interests) if interests else 'general'}

RULES: Use ONLY real places with exact names, real addresses, and 2024-2025 pricing. No generic placeholders.

JSON Response:
{{
  "overview": "Brief overview",
  "total_estimated_cost": number,
  "daily_schedule": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day theme",
      "activities": [
        {{
          "time": "9:00 AM",
          "activity": "Real venue name",
          "description": "Why it's special",
          "location": "Real address",
          "type": "sightseeing/dining/cultural",
          "estimated_cost": number,
          "duration": "X hours",
          "tips": "Insider tip"
        }}
      ],
      "dining_recommendations": ["Restaurant: Cuisine, $XX-XX"],
      "daily_cost_estimate": number
    }}
  ],
  "recommendations": {{
    "must_visit_attractions": ["Real attraction with description"],
    "local_cuisine": ["Real dish at Real Restaurant - $XX"],
    "must_try_restaurants": ["Name (Location): Cuisine, $XX, Details"],
    "hidden_gems": ["Real lesser-known spot"],
    "cultural_tips": ["Specific local tip"],
    "budget_tips": ["Money-saving tip"]
  }},
  "budget_breakdown": {{
    "accommodation_per_night": number,
    "meals_per_day": number,
    "activities_per_day": number,
    "transportation_daily": number
  }}
}}

Be specific and authentic. All {duration_days} days required."""

        try:
            # Call DeepSeek AI via OpenRouter
            response = requests.post(
                self.api_url,
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': self.model_name,
                    'messages': [
                        {
                            'role': 'system',
                            'content': '''You are an expert travel planner with deep knowledge of destinations worldwide. 
                            
CRITICAL INSTRUCTIONS:
- Provide ONLY real, verifiable information about actual places
- Use EXACT names of real restaurants, hotels, attractions, and landmarks
- Include REAL addresses and specific location details
- Never use generic placeholders like "Local Restaurant" or "Top attraction"
- Research current 2024-2025 pricing and provide accurate estimates
- Share authentic local experiences and insider knowledge
- All recommendations must be places that actually exist and can be verified

Create detailed, practical, and culturally rich travel itineraries with accurate pricing and logistics based on real venues and establishments.'''
                        },
                        {
                            'role': 'user', 
                            'content': prompt
                        }
                    ],
                    'temperature': 0.7,
                    'max_tokens': 2500  # Reduced from 4000 for faster response
                }
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                content = ai_response['choices'][0]['message']['content']
                
                # Try to parse JSON response
                try:
                    itinerary_data = json.loads(content)
                    generation_time = time.time() - start_time
                    
                    # Wrap in the expected format
                    formatted_response = {
                        "itinerary_content": itinerary_data
                    }
                    
                    print(f"✅ Generated detailed {duration_days}-day itinerary using DeepSeek AI")
                    return formatted_response, generation_time
                    
                except json.JSONDecodeError:
                    print("⚠️ Failed to parse AI response as JSON, using fallback")
                    # Fallback to structured response
                    return self._create_fallback_detailed_itinerary(trip_data), 2.0
            else:
                print(f"❌ OpenRouter API error: {response.status_code}")
                return self._create_fallback_detailed_itinerary(trip_data), 2.0
                
        except Exception as e:
            print(f"❌ Error calling DeepSeek AI: {str(e)}")
            return self._create_fallback_detailed_itinerary(trip_data), 2.0
    
    def _create_fallback_detailed_itinerary(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed fallback itinerary when AI fails"""
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        start_date = trip_data.get('start_date', datetime.now())
        
        # Normalize destination for matching
        destination_normalized = destination.lower()
        for separator in [',', '-', '(']:
            if separator in destination_normalized:
                destination_normalized = destination_normalized.split(separator)[0].strip()
        
        # Destination-specific sample activities for realistic fallback
        destination_activities = {
            "tokyo": [
                {
                    "time": "Morning (9:00 AM)",
                    "activity": "Visit Senso-ji Temple in Asakusa",
                    "description": "Explore Tokyo's oldest and most significant Buddhist temple. Walk through the iconic Kaminarimon Gate and browse traditional shops on Nakamise Street.",
                    "location": "2-3-1 Asakusa, Taito City, Tokyo",
                    "area": "Asakusa District",
                    "type": "sightseeing",
                    "estimated_cost": 0,
                    "duration": "2-3 hours",
                    "rating": 4.5,
                    "bestTime": "Early Morning",
                    "tips": "Free admission. Arrive early (7-8 AM) to avoid crowds. Try traditional snacks on Nakamise Street.",
                    "highlights": [
                        "Tokyo's oldest temple (founded 628 AD)",
                        "Iconic Thunder Gate (Kaminarimon)",
                        "Traditional shopping street Nakamise",
                        "Five-story pagoda"
                    ]
                },
                {
                    "time": "Afternoon (1:00 PM)",
                    "activity": "Explore Shibuya Crossing & Shopping",
                    "description": "Experience the world's busiest pedestrian crossing, then explore trendy shops and the famous Hachiko statue. Visit Shibuya 109 for fashion.",
                    "location": "Shibuya District, Tokyo",
                    "area": "Shibuya",
                    "type": "sightseeing",
                    "estimated_cost": 50,
                    "duration": "3-4 hours",
                    "rating": 4.7,
                    "bestTime": "Afternoon/Evening",
                    "tips": "Best view from Starbucks 2nd floor. Peak crossing time is evening rush hour.",
                    "highlights": [
                        "World's busiest pedestrian crossing",
                        "Hachiko loyal dog statue",
                        "Shibuya 109 fashion building",
                        "Vibrant youth culture hub"
                    ]
                },
                {
                    "time": "Evening (6:00 PM)",
                    "activity": "Dinner in Shinjuku's Golden Gai",
                    "description": "Enjoy yakitori and drinks in one of Golden Gai's tiny bars. Experience authentic Tokyo nightlife in this atmospheric alley district.",
                    "location": "1 Chome Kabukicho, Shinjuku City, Tokyo",
                    "area": "Shinjuku - Golden Gai",
                    "type": "dining",
                    "estimated_cost": 40,
                    "duration": "2-3 hours",
                    "rating": 4.3,
                    "bestTime": "Evening/Night",
                    "tips": "Most bars have cover charge (500-1000 yen). Some bars don't allow first-timers - look for welcoming signs.",
                    "highlights": [
                        "200+ tiny bars in narrow alleys",
                        "Authentic local atmosphere",
                        "Unique themed bars",
                        "Historic post-war architecture"
                    ]
                }
            ],
            "paris": [
                {
                    "time": "Morning (9:00 AM)",
                    "activity": "Visit the Louvre Museum",
                    "description": "Explore the world's largest art museum. See the Mona Lisa, Venus de Milo, and thousands of other masterpieces.",
                    "location": "Rue de Rivoli, 75001 Paris",
                    "area": "1st Arrondissement",
                    "type": "cultural",
                    "estimated_cost": 17,
                    "duration": "3-4 hours",
                    "rating": 4.8,
                    "bestTime": "Early Morning",
                    "tips": "Book tickets online to skip lines. Museum is free on first Sunday of month. Closed Tuesdays.",
                    "highlights": [
                        "Mona Lisa by Leonardo da Vinci",
                        "Venus de Milo sculpture",
                        "35,000+ artworks on display",
                        "Historic royal palace"
                    ]
                },
                {
                    "time": "Afternoon (2:00 PM)",
                    "activity": "Lunch in Le Marais",
                    "description": "Enjoy authentic French cuisine in the historic Marais district. Try traditional bistros or trendy cafes.",
                    "location": "Le Marais, 4th arrondissement, Paris",
                    "area": "Le Marais District",
                    "type": "dining",
                    "estimated_cost": 35,
                    "duration": "2 hours",
                    "rating": 4.6,
                    "bestTime": "Lunch/Afternoon",
                    "tips": "Try L'As du Fallafel for amazing falafel or Breizh Café for crêpes.",
                    "highlights": [
                        "Historic Jewish quarter",
                        "Trendy boutiques and galleries",
                        "Best falafel in Paris",
                        "Beautiful medieval architecture"
                    ]
                },
                {
                    "time": "Evening (7:00 PM)",
                    "activity": "Eiffel Tower at Sunset",
                    "description": "Visit the iconic Eiffel Tower. Watch the spectacular light show and enjoy panoramic views of Paris.",
                    "location": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris",
                    "area": "7th Arrondissement",
                    "type": "sightseeing",
                    "estimated_cost": 26,
                    "duration": "2-3 hours",
                    "rating": 4.9,
                    "bestTime": "Sunset/Evening",
                    "tips": "Book tickets online weeks in advance. Tower sparkles for 5 minutes every hour after sunset.",
                    "highlights": [
                        "Iconic 324-meter iron tower",
                        "Spectacular light shows",
                        "Panoramic city views",
                        "Champagne bar at summit"
                    ]
                }
            ],
            "dubai": [
                {
                    "time": "Morning (9:00 AM)",
                    "activity": "Visit Burj Khalifa Observation Deck",
                    "description": "Ascend to the world's tallest building. Enjoy breathtaking views from the 124th and 125th floors.",
                    "location": "1 Sheikh Mohammed bin Rashid Blvd, Dubai",
                    "area": "Downtown Dubai",
                    "type": "sightseeing",
                    "estimated_cost": 40,
                    "duration": "2 hours",
                    "rating": 4.8,
                    "bestTime": "Early Morning",
                    "tips": "Book online for cheaper tickets. Early morning has best visibility and smaller crowds.",
                    "highlights": [
                        "World's tallest building (828m)",
                        "360-degree panoramic views",
                        "High-speed elevators",
                        "Multimedia presentations"
                    ]
                },
                {
                    "time": "Afternoon (2:00 PM)",
                    "activity": "Gold Souk & Traditional Markets",
                    "description": "Explore Dubai's famous gold market and traditional spice souks. Practice your bargaining skills!",
                    "location": "Gold Souk, Deira, Dubai",
                    "area": "Deira - Old Dubai",
                    "type": "shopping",
                    "estimated_cost": 50,
                    "duration": "3 hours",
                    "rating": 4.4,
                    "bestTime": "Afternoon/Evening",
                    "tips": "Prices are negotiable - start at 50% of asking price. Best quality gold at competitive prices.",
                    "highlights": [
                        "Over 300 gold retailers",
                        "Traditional spice market nearby",
                        "Competitive gold prices",
                        "Historic trading atmosphere"
                    ]
                },
                {
                    "time": "Evening (7:00 PM)",
                    "activity": "Dubai Fountain Show & Dinner",
                    "description": "Watch the choreographed fountain show at Dubai Mall, then enjoy dinner at one of the waterfront restaurants.",
                    "location": "Dubai Mall, Downtown Dubai",
                    "type": "entertainment",
                    "estimated_cost": 60,
                    "duration": "3 hours",
                    "tips": "Fountain shows every 30 minutes from 6-11 PM. Free to watch. Arrive early for good viewing spots."
                }
            ]
        }
        
        # Get destination-specific activities or create generic ones
        activity_templates = destination_activities.get(destination_normalized, [
            {
                "time": "Morning (9:00 AM)",
                "activity": f"Morning Sightseeing in {destination}",
                "description": f"Start your day exploring {destination}'s iconic landmarks and cultural sites. Visit main attractions and experience the local atmosphere.",
                "location": f"{destination} City Center",
                "type": "sightseeing",
                "estimated_cost": 50,
                "duration": "3 hours",
                "tips": "Arrive early to avoid crowds, bring comfortable walking shoes, and stay hydrated."
            },
            {
                "time": "Afternoon (1:00 PM)",
                "activity": f"Cultural Experience in {destination}",
                "description": f"Immerse yourself in {destination}'s rich culture through museums, local markets, or cultural sites.",
                "location": f"{destination} Cultural District",
                "type": "cultural",
                "estimated_cost": 75,
                "duration": "4 hours",
                "tips": "Try local cuisine, interact with locals, and respect cultural norms."
            },
            {
                "time": "Evening (6:00 PM)",
                "activity": f"Evening Entertainment in {destination}",
                "description": f"Experience {destination}'s nightlife, dining scene, or evening entertainment options.",
                "location": f"{destination} Entertainment District",
                "type": "entertainment",
                "estimated_cost": 80,
                "duration": "3 hours",
                "tips": "Make dinner reservations in advance and dress appropriately for venues."
            }
        ])
        
        # Generate detailed daily schedule for all days
        daily_schedule = []
        
        for day in range(1, duration_days + 1):
            if isinstance(start_date, str):
                day_date = datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=day-1)
            else:
                day_date = start_date + timedelta(days=day-1)
            
            # Cycle through activities and adjust costs per day
            day_activities = []
            for i, template in enumerate(activity_templates):
                activity = template.copy()
                # Increment costs slightly each day
                activity['estimated_cost'] = template['estimated_cost'] + (day - 1) * 10
                day_activities.append(activity)
            
            daily_schedule.append({
                "day": day,
                "date": day_date.strftime('%Y-%m-%d'),
                "title": f"Day {day}: Exploring {destination}",
                "theme": f"Day {day} adventures and cultural experiences",
                "activities": day_activities,
                "dining_recommendations": [
                    f"Try local restaurants near your activities - ask locals for recommendations",
                    f"Explore {destination}'s food scene with authentic local cuisine"
                ],
                "daily_cost_estimate": sum(act['estimated_cost'] for act in day_activities),
                "transportation_notes": f"Use local transport options, estimated $20-30 daily"
            })
        
        # Create destination-specific recommendations based on popular destinations
        # Normalize destination for matching (lowercase, remove country/state)
        destination_normalized = destination.lower()
        for separator in [',', '-', '(']:
            if separator in destination_normalized:
                destination_normalized = destination_normalized.split(separator)[0].strip()
        
        # Destination-specific recommendations database with LOTS of real places
        destination_specifics = {
            "tokyo": {
                # Display categories (for recommendations section text display)
                "must_visit_attractions": [
                    "Senso-ji Temple (Asakusa) - Tokyo's oldest temple with iconic red lantern and Nakamise shopping street",
                    "Shibuya Crossing (Shibuya) - World's busiest pedestrian crossing, quintessential Tokyo experience",
                    "Meiji Shrine (Harajuku) - Peaceful Shinto shrine in forest setting, traditional architecture",
                    "Tokyo Skytree (Sumida) - 634m tall tower with observation decks, stunning panoramic views",
                    "Imperial Palace (Chiyoda) - Emperor's residence with beautiful gardens and historic moats",
                    "teamLab Borderless (Odaiba) - Immersive digital art museum with interactive installations",
                    "Tokyo Tower (Minato) - Iconic red tower offering city views and nighttime illumination",
                    "Ueno Park (Ueno) - Large park with museums, zoo, and spectacular cherry blossoms"
                ],
                "local_cuisine": [
                    "Authentic Ramen at Ichiran or Tsuta - $10-20, Individual booths or Michelin-starred",
                    "Fresh Sushi at Toyosu Market - $40-60, Ultra-fresh breakfast omakase at Sushi Dai",
                    "Crispy Tonkatsu at Tonki or Maisen - $12-25, Traditional breaded pork cutlet perfection",
                    "Light Tempura at Tsunahachi - $25-40, Seafood and vegetables since 1924",
                    "Street Food in Harajuku - $5-15, Crepes, takoyaki, and trendy Japanese snacks"
                ],
                "must_try_restaurants": [
                    "Ichiran Ramen (Multiple): Famous tonkotsu ramen, $10-15, Individual focus booths",
                    "Sushi Dai (Toyosu Market): Ultra-fresh omakase, $40-60, Arrive early for 1-2hr wait",
                    "Gonpachi (Nishi-Azabu): Kill Bill izakaya, $30-50, Yakitori and Japanese tapas",
                    "Afuri Ramen (Harajuku): Yuzu-citrus broth, $12-16, Light and refreshing style",
                    "Ginza Kyubey (Ginza): Premium sushi since 1935, $150-250, Exceptional Edomae-style",
                    "Nakiryu (Otsuka): Michelin-starred tantanmen, $10-15, Rich spicy sesame ramen"
                ],
                "budget_tips": [
                    "Book accommodations in advance - Capsule hotels from $25/night, business hotels $60-100",
                    "Use JR Pass for unlimited train travel - ¥29,650 ($200) for 7-day pass saves money",
                    "Eat at conveyor belt sushi or ramen shops - Delicious authentic meals for $8-15",
                    "Visit free attractions - Meiji Shrine, Senso-ji Temple, Imperial Palace gardens",
                    "Shop at Don Quijote and 100-yen stores - Great prices on souvenirs and essentials"
                ],
                "cultural_tips": [
                    "Remove shoes when entering homes, traditional restaurants, temples, and ryokan",
                    "Learn basic phrases - 'Arigatou' (thank you), 'Sumimasen' (excuse me), 'Itadakimasu' (before eating)",
                    "Bow when greeting - Slight bow shows respect, deeper bow for formal situations",
                    "No tipping in Japan - It can be considered rude, service charge included in prices",
                    "Respect temple etiquette - Bow at gates, purify hands at fountains, be quiet in prayer areas"
                ],
                "hidden_gems": [
                    "Yanaka Ginza - Traditional shopping street with cat decorations and local charm",
                    "Golden Gai (Shinjuku) - Tiny bar district, unique nightlife in cramped alleyways",
                    "Nakameguro Canal - Trendy neighborhood with cafes and cherry blossoms",
                    "teamLab Borderless (Odaiba) - Digital art museum with immersive installations",
                    "Kagurazaka - Historic geisha district with cobblestone streets",
                    "Shimokitazawa - Bohemian area with vintage shops and live music venues"
                ],
                # Map categories (for interactive map markers with detailed place objects)
                "sightseeing": [
                    {"name": "Senso-ji Temple", "type": "sightseeing", "area": "Asakusa", "description": "Tokyo's oldest temple founded in 628 AD"},
                    {"name": "Shibuya Crossing", "type": "sightseeing", "area": "Shibuya", "description": "World's busiest pedestrian crossing"},
                    {"name": "Meiji Shrine", "type": "sightseeing", "area": "Harajuku", "description": "Peaceful Shinto shrine in forest"},
                    {"name": "Tokyo Skytree", "type": "sightseeing", "area": "Sumida", "description": "634m observation tower with city views"},
                    {"name": "Imperial Palace", "type": "sightseeing", "area": "Chiyoda", "description": "Emperor's residence with beautiful gardens"},
                    {"name": "Ueno Park", "type": "sightseeing", "area": "Ueno", "description": "Large park with museums and zoo"},
                    {"name": "Tokyo Tower", "type": "sightseeing", "area": "Minato", "description": "Iconic 333m red tower"},
                    {"name": "Roppongi Hills", "type": "sightseeing", "area": "Roppongi", "description": "Modern complex with Mori Art Museum"},
                    {"name": "Odaiba", "type": "sightseeing", "area": "Odaiba", "description": "Futuristic island with teamLab museum"},
                    {"name": "Harajuku Takeshita Street", "type": "sightseeing", "area": "Harajuku", "description": "Youth fashion and culture hub"}
                ],
                "food_dining": [
                    {"name": "Ichiran Ramen", "type": "restaurant", "area": "Multiple locations", "description": "Famous tonkotsu ramen, $10-15"},
                    {"name": "Sushi Dai", "type": "restaurant", "area": "Tsukiji", "description": "Fresh sushi breakfast, $30-50"},
                    {"name": "Tonki", "type": "restaurant", "area": "Meguro", "description": "Best tonkatsu in Tokyo, $12-18"},
                    {"name": "Tempura Tsunahachi", "type": "restaurant", "area": "Shinjuku", "description": "Traditional tempura, $25-40"},
                    {"name": "Gonpachi", "type": "restaurant", "area": "Nishi-Azabu", "description": "Kill Bill restaurant, $30-50"},
                    {"name": "Sukiyabashi Jiro", "type": "restaurant", "area": "Ginza", "description": "3-Michelin star sushi, $$$$"},
                    {"name": "Tsuta", "type": "restaurant", "area": "Sugamo", "description": "Michelin ramen, $12-18"},
                    {"name": "Katsukura", "type": "restaurant", "area": "Shinjuku", "description": "Premium pork cutlets, $15-25"},
                    {"name": "Afuri Ramen", "type": "restaurant", "area": "Harajuku", "description": "Yuzu citrus ramen, $10-15"},
                    {"name": "Nakiryu", "type": "restaurant", "area": "Otsuka", "description": "Michelin tantanmen ramen, $12"},
                    {"name": "Ginza Kyubey", "type": "restaurant", "area": "Ginza", "description": "High-end sushi, $100-200"},
                    {"name": "Maisen", "type": "restaurant", "area": "Omotesando", "description": "Tonkatsu specialist, $15-25"}
                ],
                "shopping": [
                    {"name": "Shibuya 109", "type": "shopping", "area": "Shibuya", "description": "Iconic fashion department store"},
                    {"name": "Takeshita Street", "type": "shopping", "area": "Harajuku", "description": "Youth fashion and trendy shops"},
                    {"name": "Ginza Six", "type": "shopping", "area": "Ginza", "description": "Luxury shopping complex"},
                    {"name": "Don Quijote", "type": "shopping", "area": "Multiple locations", "description": "Discount variety store"},
                    {"name": "Omotesando Hills", "type": "shopping", "area": "Omotesando", "description": "High-end fashion mall"},
                    {"name": "Nakamise Shopping Street", "type": "shopping", "area": "Asakusa", "description": "Traditional souvenir shops"},
                    {"name": "Akihabara Electric Town", "type": "shopping", "area": "Akihabara", "description": "Electronics and anime hub"},
                    {"name": "Tokyu Hands", "type": "shopping", "area": "Shibuya", "description": "Multi-floor lifestyle store"}
                ],
                "cultural": [
                    {"name": "Kabuki-za Theatre", "type": "cultural", "area": "Ginza", "description": "Traditional kabuki performances"},
                    {"name": "Tokyo National Museum", "type": "cultural", "area": "Ueno", "description": "Japanese art and antiquities"},
                    {"name": "Mori Art Museum", "type": "cultural", "area": "Roppongi", "description": "Contemporary art exhibitions"},
                    {"name": "Ghibli Museum", "type": "cultural", "area": "Mitaka", "description": "Studio Ghibli animation museum"},
                    {"name": "Nezu Museum", "type": "cultural", "area": "Omotesando", "description": "Pre-modern Japanese art"},
                    {"name": "Edo-Tokyo Museum", "type": "cultural", "area": "Ryogoku", "description": "Tokyo history museum"},
                    {"name": "teamLab Borderless", "type": "cultural", "area": "Odaiba", "description": "Digital art immersive museum"},
                    {"name": "Sumo Tournament", "type": "cultural", "area": "Ryogoku", "description": "Traditional sumo wrestling"}
                ],
                "attractions": [
                    {"name": "Tokyo Disneyland", "type": "attraction", "area": "Urayasu", "description": "Disney theme park"},
                    {"name": "Tokyo DisneySea", "type": "attraction", "area": "Urayasu", "description": "Unique nautical Disney park"},
                    {"name": "Robot Restaurant", "type": "attraction", "area": "Shinjuku", "description": "Wild robot show and dinner"},
                    {"name": "Pokemon Center", "type": "attraction", "area": "Multiple", "description": "Official Pokemon merchandise"},
                    {"name": "Mario Kart Street Racing", "type": "attraction", "area": "Shibuya", "description": "Go-kart through Tokyo streets"},
                    {"name": "Oedo Onsen", "type": "attraction", "area": "Odaiba", "description": "Hot spring theme park"},
                    {"name": "Cat Cafe", "type": "attraction", "area": "Harajuku", "description": "Relax with cats"},
                    {"name": "Owl Cafe", "type": "attraction", "area": "Harajuku", "description": "Interact with owls"}
                ],
                "hidden_gems": [
                    {"name": "Yanaka Ginza", "type": "attraction", "area": "Yanaka", "description": "Old Tokyo shopping street"},
                    {"name": "Golden Gai", "type": "attraction", "area": "Shinjuku", "description": "200+ tiny bars"},
                    {"name": "Nakameguro Canal", "type": "sightseeing", "area": "Nakameguro", "description": "Cherry blossom canal walk"},
                    {"name": "Kagurazaka", "type": "sightseeing", "area": "Shinjuku", "description": "French-influenced hillside"},
                    {"name": "Shimokitazawa", "type": "shopping", "area": "Setagaya", "description": "Vintage shops and cafes"},
                    {"name": "Daikanyama", "type": "shopping", "area": "Shibuya", "description": "Upscale boutiques"},
                    {"name": "Koenji", "type": "shopping", "area": "Suginami", "description": "Vintage clothing haven"}
                ],
                "must_visit_attractions": [
                    "Senso-ji Temple in Asakusa - Tokyo's oldest and most significant Buddhist temple",
                    "Shibuya Crossing - The world's busiest pedestrian crossing",
                    "Meiji Shrine - Peaceful shrine dedicated to Emperor Meiji and Empress Shoken",
                    "Tokyo Skytree - 634m tall tower with spectacular city views",
                    "Tsukiji Outer Market - Fresh seafood and street food paradise"
                ],
                "local_cuisine": [
                    "Authentic Ramen at Ichiran or Ippudo - $8-15 per bowl",
                    "Fresh Sushi at Sushi Dai or Daiwa Sushi (Tsukiji) - $30-50 per person",
                    "Tonkatsu at Tonki in Meguro - $12-18 per person",
                    "Tempura at Tempura Tsunahachi - $25-40 per person",
                    "Street Takoyaki and Yakitori in Shibuya - $5-10"
                ],
                "must_try_restaurants": [
                    "Ichiran Ramen (Multiple locations): Famous tonkotsu ramen, $10-15, Solo dining booths",
                    "Sukiyabashi Jiro (Ginza): World-renowned sushi, $$$$, Reservations required months ahead",
                    "Katsukura (Kyoto Station): Premium tonkatsu, $15-25, Crispy pork cutlets",
                    "Tsuta (Sugamo): Michelin-starred ramen, $12-18, Arrive early",
                    "Gonpachi (Nishi-Azabu): Traditional izakaya, $30-50, Featured in Kill Bill"
                ],
                "hidden_gems": [
                    "Yanaka Ginza - Traditional old Tokyo shopping street with local charm",
                    "teamLab Borderless - Digital art museum in Odaiba",
                    "Golden Gai - Tiny bar district in Shinjuku with unique atmosphere",
                    "Sumida River Cruise - Scenic boat ride under cherry blossoms",
                    "Nakameguro - Trendy canal-side neighborhood with cafes and boutiques"
                ]
            },
            "paris": {
                "must_visit_attractions": [
                    "Eiffel Tower - Iconic iron lattice tower, book tickets online to skip lines",
                    "Louvre Museum - World's largest art museum, home to Mona Lisa",
                    "Notre-Dame Cathedral - Gothic masterpiece (currently under restoration)",
                    "Arc de Triomphe - Napoleonic monument with rooftop views",
                    "Sacré-Cœur Basilica - Stunning white church atop Montmartre hill"
                ],
                "local_cuisine": [
                    "Croissants at Du Pain et des Idées - $3-5, Best in Paris",
                    "Steak Frites at Le Relais de l'Entrecôte - $30-40 per person",
                    "Macarons at Ladurée or Pierre Hermé - $2-3 each",
                    "French Onion Soup at Au Pied de Cochon - $15-20",
                    "Crepes at street vendors in Montmartre - $5-10"
                ],
                "must_try_restaurants": [
                    "L'Ami Jean (Rue Malar): Basque cuisine, $50-70 per person, Cozy atmosphere",
                    "Breizh Café (Le Marais): Authentic Breton crêpes, $20-30, Organic ingredients",
                    "Le Comptoir du Relais (Saint-Germain): Bistro classics, $40-60, Book ahead",
                    "Pink Mamma (Pigalle): Italian rooftop dining, $35-50, Instagram-worthy",
                    "Bouillon Chartier (Grands Boulevards): Historic brasserie, $20-30, Affordable classics"
                ],
                "hidden_gems": [
                    "Musée Rodin Gardens - Beautiful sculpture garden, peaceful escape",
                    "Canal Saint-Martin - Hip neighborhood for picnics and people-watching",
                    "Sainte-Chapelle - Stunning stained glass chapel, often overlooked",
                    "Marché des Enfants Rouges - Oldest covered market in Paris",
                    "Promenade Plantée - Elevated park, inspiration for NYC's High Line"
                ]
            },
            "dubai": {
                "must_visit_attractions": [
                    "Burj Khalifa - World's tallest building, observation deck on 124th floor",
                    "Dubai Mall - Massive shopping center with Dubai Aquarium inside",
                    "Palm Jumeirah - Artificial island with luxury hotels and beaches",
                    "Dubai Fountain - Choreographed fountain show at Dubai Mall",
                    "Gold Souk - Traditional market for gold jewelry shopping"
                ],
                "local_cuisine": [
                    "Shawarma at Al Mallah - $3-5, Best street food in Dubai",
                    "Arabic Mezze at Al Nafoorah - $40-60 per person",
                    "Emirati Breakfast at Arabian Tea House - $15-25",
                    "Kunafa at Firas Sweets - $5-8, Traditional dessert",
                    "Fresh Dates and Arabic Coffee - Free at most venues"
                ],
                "must_try_restaurants": [
                    "Al Hadheerah (Bab Al Shams): Desert dining experience, $80-120, Live entertainment",
                    "Pierchic (Al Qasr): Seafood on a pier, $100-150, Romantic setting",
                    "Ravi Restaurant (Satwa): Pakistani curry, $10-15, Local favorite since 1978",
                    "Zuma (DIFC): Contemporary Japanese, $80-120, Celebrity hotspot",
                    "Bu Qtair (Umm Suqeim): Cheap seafood shack, $15-25, No-frills authentic"
                ],
                "hidden_gems": [
                    "Al Fahidi Historical District - Old Dubai with traditional wind towers",
                    "Alserkal Avenue - Contemporary art galleries in industrial warehouses",
                    "Ras Al Khor Wildlife Sanctuary - Flamingo viewing point",
                    "La Mer Beach - Modern beach development with street art",
                    "Dubai Miracle Garden - Seasonal flower garden with unique displays"
                ]
            },
            "london": {
                "must_visit_attractions": [
                    "British Museum - Free admission, world-class collection including Rosetta Stone",
                    "Tower of London - Historic castle housing Crown Jewels, book online",
                    "Big Ben & Houses of Parliament - Iconic clock tower and government building",
                    "Buckingham Palace - Royal residence, Changing of Guard at 11:00 AM",
                    "London Eye - Giant observation wheel on South Bank"
                ],
                "local_cuisine": [
                    "Fish & Chips at Poppies (Spitalfields) - $15-20, Traditional recipe since 1945",
                    "Sunday Roast at The Harwood Arms - $25-35, Britain's only Michelin pub",
                    "Afternoon Tea at Sketch - $60-80, Instagram-worthy pink room",
                    "Pie & Mash at M. Manze - $10-15, Traditional East End dish",
                    "Full English Breakfast at The Wolseley - $20-30"
                ],
                "must_try_restaurants": [
                    "Dishoom (Multiple locations): Bombay café, $20-35, Book ahead for dinner",
                    "Borough Market: Food stalls, $10-20, Thursday-Saturday only",
                    "Hawksmoor (Seven Dials): British steakhouse, $50-80, Dry-aged beef",
                    "Padella (Borough): Fresh pasta, $12-18, Expect queues",
                    "St. John (Smithfield): Nose-to-tail dining, $50-70, Iconic British cuisine"
                ],
                "hidden_gems": [
                    "Sky Garden - Free rooftop garden with panoramic views (book ahead)",
                    "Leake Street Tunnel - Legal graffiti tunnel under Waterloo Station",
                    "God's Own Junkyard - Neon sign museum in Walthamstow",
                    "Hampstead Heath - Sprawling park with swimming ponds and city views",
                    "Neal's Yard - Colorful courtyard in Covent Garden"
                ]
            },
            "new york": {
                "must_visit_attractions": [
                    "Central Park - 843-acre urban park, perfect for walking or picnicking",
                    "Statue of Liberty & Ellis Island - Book ferry tickets in advance online",
                    "The Metropolitan Museum of Art - Pay-what-you-wish admission for NY residents",
                    "Times Square - Bright lights and Broadway shows",
                    "Brooklyn Bridge - Walk across for Manhattan skyline views"
                ],
                "local_cuisine": [
                    "New York Pizza at Joe's Pizza (Greenwich Village) - $3-5 per slice",
                    "Pastrami on Rye at Katz's Delicatessen - $20-25, Since 1888",
                    "Bagels at Russ & Daughters - $10-15, Lower East Side institution",
                    "Hot Dogs at Gray's Papaya - $5-8, NYC classic",
                    "Cheesecake at Junior's - $8-10 per slice"
                ],
                "must_try_restaurants": [
                    "Peter Luger Steak House (Brooklyn): Legendary steakhouse, $100-150, Cash only",
                    "Xi'an Famous Foods: Hand-pulled noodles, $10-15, Multiple locations",
                    "Shake Shack (Madison Square Park): Gourmet burgers, $12-18, NYC original",
                    "Levain Bakery (UWS): Giant cookies, $5-6, Arrive early",
                    "The Halal Guys: Street cart chicken, $8-12, Lines move fast"
                ],
                "hidden_gems": [
                    "The High Line - Elevated park built on old railway tracks",
                    "Roosevelt Island Tramway - Scenic cable car ride for subway fare",
                    "The Cloisters - Medieval art museum in Fort Tryon Park",
                    "DUMBO - Trendy Brooklyn neighborhood with Instagram spots",
                    "Grand Central Terminal's Whispering Gallery - Acoustic phenomenon"
                ]
            }
        }
        
        # Get destination-specific data or use generic fallback
        specific_recs = destination_specifics.get(destination_normalized, {
            "must_visit_attractions": [
                f"Research top-rated attractions in {destination} before your trip",
                f"Visit the main cultural landmarks and historical sites of {destination}",
                f"Explore local markets and authentic neighborhoods in {destination}"
            ],
            "local_cuisine": [
                f"Try traditional local dishes specific to {destination}",
                f"Visit local markets for authentic street food in {destination}",
                f"Ask locals for their favorite restaurants in {destination}"
            ],
            "must_try_restaurants": [
                f"Research highly-rated local restaurants in {destination} on TripAdvisor",
                f"Ask your hotel concierge for authentic dining recommendations",
                f"Look for restaurants popular with locals, not just tourists"
            ],
            "hidden_gems": [
                f"Explore off-the-beaten-path neighborhoods in {destination}",
                f"Visit local markets and artisan shops",
                f"Discover lesser-known viewpoints and photo spots"
            ]
        })
        
        # Generate AI recommendations if in hybrid/ai mode
        ai_recommendations = None
        if self.performance_mode in ['hybrid', 'ai']:
            print("=" * 80)
            print("🤖 GENERATING AI-POWERED RECOMMENDATIONS...")
            print(f"🎯 Destination: {destination}, Mode: {self.performance_mode}")
            print(f"📡 API Key present: {bool(self.api_key)}")
            print(f"📡 API Key (first 20 chars): {self.api_key[:20] if self.api_key else 'NONE'}")
            print("=" * 80)
            
            # Try AI with retry logic (3 attempts)
            max_retries = 3
            for attempt in range(1, max_retries + 1):
                print(f"🔄 AI Attempt {attempt}/{max_retries}...")
                ai_recommendations = self._generate_ai_recommendations(trip_data)
                
                if ai_recommendations:
                    print("=" * 80)
                    print("✅ AI RECOMMENDATIONS GENERATED SUCCESSFULLY!")
                    print("=" * 80)
                    break
                else:
                    print(f"⚠️ Attempt {attempt} failed")
                    if attempt < max_retries:
                        print(f"⏳ Retrying in 1 second...")
                        time.sleep(1)
                    else:
                        print("=" * 80)
                        print("❌ AI RECOMMENDATIONS FAILED AFTER 3 ATTEMPTS")
                        print("=" * 80)
        
        # CRITICAL: Use AI recommendations if available, otherwise use enhanced static ones
        if ai_recommendations:
            print(f"🎉 Using AI-generated recommendations for {destination}")
            # Add map categories from static data (AI doesn't generate map markers)
            ai_recommendations['sightseeing'] = specific_recs.get("sightseeing", [])
            ai_recommendations['food_dining'] = specific_recs.get("food_dining", [])
            ai_recommendations['shopping'] = specific_recs.get("shopping", [])
            ai_recommendations['cultural'] = specific_recs.get("cultural", [])
            ai_recommendations['attractions'] = specific_recs.get("attractions", [])
            ai_recommendations['adventure'] = specific_recs.get("adventure", [])
            recommendations = ai_recommendations
        else:
            print(f"📋 Using static recommendations for {destination}")
            recommendations = {
                # Main recommendation categories for display
                "budget_tips": specific_recs.get("budget_tips", [
                    "Book accommodations in advance for better rates",
                    "Use public transportation when available",
                    "Try local street food for authentic and affordable meals"
                ]),
                "cultural_tips": specific_recs.get("cultural_tips", [
                    "Respect local customs and traditions",
                    "Learn basic local phrases for better interaction",
                    "Dress appropriately for cultural and religious sites"
                ]),
                "local_cuisine": specific_recs.get("local_cuisine", [
                    f"Traditional {destination} dish",
                    f"Local {destination} specialty",
                    f"Street food {destination}"
                ]),
                "must_visit_attractions": specific_recs.get("must_visit_attractions", [
                    f"Top {destination} landmark",
                    f"Cultural {destination} site",
                    f"Hidden {destination} gem"
                ]),
                "hidden_gems": specific_recs.get("hidden_gems", [
                    f"Hidden {destination} gem",
                    f"Local favorite spot"
                ]),
                "must_try_restaurants": specific_recs.get("must_try_restaurants", [
                    f"Research highly-rated local restaurants in {destination}",
                    f"Ask locals for recommendations"
                ]),
                # Detailed map categories with lots of places
                "sightseeing": specific_recs.get("sightseeing", []),
                "food_dining": specific_recs.get("food_dining", []),
                "shopping": specific_recs.get("shopping", []),
                "cultural": specific_recs.get("cultural", []),
                "attractions": specific_recs.get("attractions", []),
                "adventure": specific_recs.get("adventure", [])
            }
        
        # DEBUG: Log what recommendations are being returned
        print("=" * 80)
        print("🎯 FINAL RECOMMENDATIONS DEBUG")
        print(f"📍 Destination: {destination}")
        print(f"🤖 AI Mode: {self.performance_mode}")
        print(f"💡 Using AI recommendations: {'YES' if ai_recommendations else 'NO'}")
        print(f"📋 Recommendation categories: {list(recommendations.keys())}")
        print(f"💰 Budget Tips ({len(recommendations.get('budget_tips', []))}): {recommendations.get('budget_tips', [])[:2]}")
        print(f"🎎 Cultural Tips ({len(recommendations.get('cultural_tips', []))}): {recommendations.get('cultural_tips', [])[:2]}")
        print(f"🍜 Local Cuisine ({len(recommendations.get('local_cuisine', []))}): {recommendations.get('local_cuisine', [])[:2]}")
        print(f"🏛️ Must Visit ({len(recommendations.get('must_visit_attractions', []))}): {recommendations.get('must_visit_attractions', [])[:2]}")
        print(f"🍽️ Restaurants ({len(recommendations.get('must_try_restaurants', []))}): {recommendations.get('must_try_restaurants', [])[:2]}")
        print(f"💎 Hidden Gems ({len(recommendations.get('hidden_gems', []))}): {recommendations.get('hidden_gems', [])[:2]}")
        print("=" * 80)
        
        return {
            "itinerary_content": {
                "overview": f"Experience the very best of {destination} with this comprehensive {duration_days}-day itinerary. Each day offers unique experiences from cultural immersion to adventure activities, designed to showcase {destination}'s diverse attractions and authentic local life.",
                "total_estimated_cost": sum(day["daily_cost_estimate"] for day in daily_schedule),
                "daily_schedule": daily_schedule,
                "recommendations": recommendations,
                "budget_breakdown": {
                    "accommodation_per_night": 100,
                    "meals_per_day": 60,
                    "activities_per_day": 150,
                    "transportation_daily": 25,
                    "shopping_souvenirs": 200,
                    "emergency_buffer": 300
                }
            }
        }
    
    def generate_budget_estimate(self, trip_data: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
        """Generate detailed budget estimate using DeepSeek AI"""
        
        # Fast mode: Use fallback immediately
        if self.performance_mode == 'fast':
            print("⚡ FAST MODE: Using instant budget fallback")
            start_time = time.time()
            result = self._create_fallback_budget(trip_data)
            elapsed = time.time() - start_time
            return result, elapsed
        
        print("💰 Generating comprehensive budget estimate with DeepSeek AI...")
        
        start_time = time.time()
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        budget_level = trip_data.get('budget', 'mid-range')
        adults = trip_data.get('adults', 2)
        children = trip_data.get('children', 0)
        travel_style = trip_data.get('travel_style', 'cultural')
        
        # Create concise budget prompt (optimized for speed)
        budget_prompt = f"""Budget breakdown for {duration_days}-day {destination} trip.

Details: {adults} adults, {children} kids, {budget_level} budget, {travel_style} style

RULES: Use real 2024-2025 prices, real hotel/restaurant names.

JSON:
{{
  "accommodation": {{
    "budget_min": number,
    "budget_max": number,
    "recommendations": ["Hotel: $XX/night, Area"],
    "daily_average": number
  }},
  "transportation": {{
    "airport_transfers": number,
    "local_daily": number,
    "total_transport": number,
    "options": ["Option: $XX"]
  }},
  "food": {{
    "budget_daily": number,
    "luxury_daily": number,
    "total_food_budget": number,
    "total_food_luxury": number,
    "dining_recommendations": ["Restaurant: $XX"]
  }},
  "activities": {{
    "daily_activity_budget": number,
    "total_activities": number,
    "must_see_attractions": [{{"name": "Real place", "cost": number}}],
    "free_activities": ["Real free option"]
  }},
  "shopping": {{
    "souvenirs_budget": number,
    "luxury_shopping": number,
    "local_markets": "Market: $XX"
  }},
  "miscellaneous": {{
    "emergency_fund": number,
    "tips_gratuities": number,
    "phone_internet": number
  }},
  "total_estimates": {{
    "budget_total": number,
    "mid_range_total": number,
    "luxury_total": number
  }},
  "daily_breakdown": {{
    "budget_per_day": number,
    "luxury_per_day": number
  }},
  "money_saving_tips": ["Specific tip for {destination}"],
  "currency_info": {{
    "local_currency": "Name (CODE)",
    "exchange_rate_usd": number,
    "payment_methods": ["Methods in {destination}"]
  }}
}}

Be accurate and specific for {destination}."""

        try:
            # Call DeepSeek AI for budget estimation
            response = requests.post(
                self.api_url,
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': self.model_name,
                    'messages': [
                        {
                            'role': 'system',
                            'content': '''You are a financial travel advisor with expertise in global travel costs. 

CRITICAL INSTRUCTIONS:
- Provide accurate, realistic budget estimates based on CURRENT 2024-2025 market rates
- Use REAL hotel names with actual price ranges
- Include REAL restaurant names with current menu prices
- Calculate accurate transportation costs for the specific destination
- Never use placeholder prices - all costs must reflect actual current rates
- Research and provide verifiable pricing information
- Include specific venue names and real costs

Provide accurate, realistic budget estimates based on current market rates and real establishments.'''
                        },
                        {
                            'role': 'user',
                            'content': budget_prompt
                        }
                    ],
                    'temperature': 0.3,
                    'max_tokens': 1500  # Reduced from 2000 for faster response
                }
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                content = ai_response['choices'][0]['message']['content']
                
                try:
                    budget_data = json.loads(content)
                    generation_time = time.time() - start_time
                    print(f"✅ Generated detailed budget using DeepSeek AI")
                    return budget_data, generation_time
                    
                except json.JSONDecodeError:
                    print("⚠️ Failed to parse budget response as JSON, using fallback")
                    return self._create_fallback_budget(trip_data), 1.5
            else:
                print(f"❌ OpenRouter API error for budget: {response.status_code}")
                return self._create_fallback_budget(trip_data), 1.5
                
        except Exception as e:
            print(f"❌ Error calling DeepSeek AI for budget: {str(e)}")
            return self._create_fallback_budget(trip_data), 1.5
    
    
    def _generate_ai_recommendations(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered recommendations using DeepSeek"""
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        budget = trip_data.get('budget', 'mid-range')
        travel_style = trip_data.get('travel_style', 'cultural')
        
        prompt = f"""You are a local expert creating a travel guide for {destination}.

TRIP DETAILS:
- Destination: {destination}
- Duration: {duration_days} days
- Budget: {budget}
- Travel Style: {travel_style}

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. ONLY use real, verifiable places that exist in {destination}
2. Include EXACT business names (e.g., "Ichiran Ramen", NOT "a ramen shop")
3. Include specific DISTRICTS/AREAS (e.g., "Shibuya", "Asakusa")
4. Provide REAL 2024-2025 prices (e.g., "$12-18", NOT "affordable")
5. Add insider details (e.g., "arrive before 9am to avoid queue")
6. FORBIDDEN: Generic terms like "local restaurant", "top attraction", "hidden gem" without specific names
7. Every place must be findable on Google Maps

RESPONSE FORMAT (strict JSON):
{{
  "budget_tips": [
    "Book [REAL HOTEL NAME] in [AREA] for $XX-YY/night, includes breakfast",
    "Use [SPECIFIC TRANSPORT PASS] for ¥X,XXX ($XX) - unlimited travel",
    "Eat at [REAL RESTAURANT CHAIN] for $X-X per meal - locals' favorite",
    "Visit [SPECIFIC FREE ATTRACTION] - no entrance fee, open 24/7",
    "Shop at [REAL STORE NAME] for souvenirs - 30-50% cheaper than tourist areas",
    "Get [SPECIFIC CITY PASS] for $XX - includes YY attractions"
  ],
  "cultural_tips": [
    "Remove shoes before entering [SPECIFIC SITUATIONS] - look for genkan entrance area",
    "Bow at [X] degrees for casual greeting, [Y] degrees for formal situations",
    "Learn these exact phrases: '[PHRASE 1]' ([meaning]), '[PHRASE 2]' ([meaning])",
    "No tipping in {destination} - it's [cultural reason], service included",
    "At [SPECIFIC VENUE TYPE], follow [SPECIFIC ETIQUETTE RULE]",
    "Avoid [SPECIFIC BEHAVIOR] in [SPECIFIC PLACES] - considered disrespectful"
  ],
  "local_cuisine": [
    "[DISH NAME] at [REAL RESTAURANT] ([Area]) - $XX-XX, [what makes it special]",
    "[DISH NAME] at [REAL RESTAURANT] ([Area]) - $XX-XX, [unique feature, e.g., 'Michelin-starred']",
    "[DISH NAME] at [REAL RESTAURANT] ([Area]) - $XX-XX, [insider tip, e.g., 'arrive before 11am']",
    "[DISH NAME] at [REAL RESTAURANT] ([Area]) - $XX-XX, [what locals say]",
    "[STREET FOOD] at [SPECIFIC MARKET/STREET] - $X-X, [when to go]",
    "[SPECIALTY DISH] at [RESTAURANT NAME] - $XX-XX, [why it's famous]"
  ],
  "must_visit_attractions": [
    "[EXACT ATTRACTION NAME] ([District]) - [Specific details: built in YEAR, height XXm, famous for YYY]",
    "[REAL TEMPLE/SHRINE NAME] ([Area]) - [History: founded XXX, significance YYY, entrance fee $Z]",
    "[SPECIFIC LANDMARK] ([Location]) - [Unique features, best time to visit, pro tip]",
    "[MUSEUM/GALLERY NAME] ([District]) - [Collection highlights, ticket price, insider advice]",
    "[NEIGHBORHOOD/DISTRICT NAME] - [What it's known for, what to see, when to go]",
    "[VIEWPOINT/OBSERVATION DECK] ([Building]) - [Height, views, cost, best time]",
    "[PARK/GARDEN NAME] ([Area]) - [Size, highlights, seasonal features, free/paid]",
    "[CULTURAL VENUE] ([Location]) - [What happens there, prices, booking info]"
  ],
  "must_try_restaurants": [
    "[RESTAURANT NAME] ([District]): [Cuisine], $XX-XX, [Signature dish, atmosphere, booking needed?]",
    "[RESTAURANT NAME] ([Area]): [Cuisine], $XX-XX, [Awards/Michelin stars, specialty, insider tip]",
    "[RESTAURANT NAME] ([Location]): [Cuisine], $XX-XX, [Why locals love it, best dishes]",
    "[CHAIN/CASUAL NAME] ([Multiple]): [Cuisine], $X-X, [What to order, when crowded]",
    "[FINE DINING NAME] ([District]): [Cuisine], $XXX-XXX, [Dress code, booking months ahead]",
    "[STREET FOOD VENDOR] ([Market/Street]): [Specialty], $X-X, [Operating hours, cash only?]"
  ],
  "hidden_gems": [
    "[SPECIFIC HIDDEN SPOT] ([Neighborhood]) - [Why tourists miss it, what makes it special, how to find it]",
    "[LESSER-KNOWN ATTRACTION] ([Area]) - [What it is, why locals love it, best time to visit]",
    "[SECRET BAR/CAFÉ/SHOP] ([District]) - [What's unique, how to access, insider knowledge]",
    "[OFF-BEAT NEIGHBORHOOD] - [Vibe, what to see, why not in guidebooks]",
    "[QUIRKY VENUE/EXPERIENCE] ([Location]) - [What it is, cost, why fun/interesting]",
    "[LOCAL HANGOUT] ([Area]) - [What locals do there, best time, price range]"
  ]
}}

EXAMPLES OF GOOD RESPONSES:
✅ "Book Hotel Gracery Shinjuku for $80-120/night near Kabukicho, has Godzilla on roof"
✅ "Tonkatsu at Maisen (Omotesando) - $15-25, in converted bathhouse, crispy Kurobuta pork"
✅ "Yanaka Ginza (Yanaka) - 170m shopping street with 70+ stores, cat statues, zero tourists"

EXAMPLES OF BAD RESPONSES:
❌ "Book accommodations in advance for better rates" (no specific hotel)
❌ "Try traditional local dish" (no restaurant name)
❌ "Visit hidden gems off the beaten path" (no specific place)

Generate recommendations NOW. Be specific or fail."""

        try:
            # Pre-flight checks
            if not self.api_key:
                print("❌ CRITICAL: No API key available!")
                print("❌ Set OPENROUTER_API_KEY in backend/travel_backend/settings.py")
                return None
            
            if len(self.api_key) < 20:
                print(f"❌ CRITICAL: API key looks invalid (too short: {len(self.api_key)} chars)")
                return None
            
            print(f"📡 Calling DeepSeek AI for {destination} recommendations...")
            print(f"🔑 Using API key: {self.api_key[:10]}...{self.api_key[-5:]}")
            print(f"🌐 API URL: {self.api_url}")
            print(f"🤖 Model: {self.model_name}")
            
            response = requests.post(
                self.api_url,
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': self.model_name,
                    'messages': [
                        {
                            'role': 'system',
                            'content': '''You are a local travel expert with insider knowledge of destinations worldwide.

CRITICAL INSTRUCTIONS:
- Provide ONLY real, verifiable places that actually exist
- Use EXACT names of real restaurants, attractions, shops, neighborhoods
- Include REAL addresses, districts, and specific location details
- NEVER use generic terms like "Local Restaurant", "Top attraction", "City landmark"
- Research and provide accurate 2024-2025 current pricing
- Share authentic insider knowledge and local favorites
- Every recommendation must be a place that can be found on Google Maps
- Be specific about locations: use district names, street names, landmarks

Your recommendations should be so specific that a traveler could immediately book or visit these exact places.'''
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'temperature': 0.8,  # Slightly higher for creative recommendations
                    'max_tokens': 2000,
                    'top_p': 0.9
                },
                timeout=15  # 15 second timeout for recommendations
            )
            
            print(f"📨 Response status: {response.status_code}")
            
            if response.status_code == 200:
                ai_response = response.json()
                content = ai_response['choices'][0]['message']['content']
                
                print(f"📝 AI response length: {len(content)} characters")
                print(f"📝 AI response preview: {content[:200]}...")
                
                try:
                    # Try to extract JSON from markdown code blocks if present
                    if '```json' in content:
                        content = content.split('```json')[1].split('```')[0].strip()
                    elif '```' in content:
                        content = content.split('```')[1].split('```')[0].strip()
                    
                    recommendations = json.loads(content)
                    print(f"✅ Successfully parsed AI recommendations for {destination}")
                    print(f"📋 Categories: {list(recommendations.keys())}")
                    
                    # Add empty map categories (these use static data)
                    recommendations['sightseeing'] = []
                    recommendations['food_dining'] = []
                    recommendations['shopping'] = []
                    recommendations['cultural'] = []
                    recommendations['attractions'] = []
                    recommendations['adventure'] = []
                    
                    return recommendations
                except json.JSONDecodeError as json_err:
                    print(f"❌ JSON Parse Error: {str(json_err)}")
                    print(f"📄 Content that failed to parse: {content[:500]}")
                    return None
            else:
                print(f"❌ AI API returned error status: {response.status_code}")
                print(f"📄 Response body: {response.text[:500]}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"⏱️ AI recommendations request timed out for {destination}")
            return None
        except requests.exceptions.RequestException as req_err:
            print(f"🌐 Network error calling AI API: {str(req_err)}")
            return None
        except Exception as e:
            print(f"💥 Unexpected error generating AI recommendations: {str(e)}")
            import traceback
            print(f"🔍 Traceback: {traceback.format_exc()}")
            return None
    
    def _create_fallback_budget(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed fallback budget when AI fails"""
        destination = trip_data.get('destination', 'Unknown')
        duration_days = trip_data.get('duration_days', 3)
        
        # Base costs that scale with destination and duration
        accommodation_base = 80
        food_base = 50
        activity_base = 75
        transport_base = 25
        
        return {
            "accommodation": {
                "budget_min": accommodation_base * 0.5 * duration_days,
                "budget_max": accommodation_base * 2.5 * duration_days,
                "recommendations": [
                    f"Budget Hotel in {destination}: ${accommodation_base * 0.5}/night",
                    f"Mid-range Hotel in {destination}: ${accommodation_base}/night",
                    f"Luxury Hotel in {destination}: ${accommodation_base * 2.5}/night"
                ],
                "daily_average": accommodation_base
            },
            "transportation": {
                "airport_transfers": 50,
                "local_daily": transport_base,
                "total_transport": transport_base * duration_days + 50,
                "options": ["Public Transport", "Ride-sharing", "Private Car"]
            },
            "food": {
                "budget_daily": food_base * 0.6,
                "luxury_daily": food_base * 2,
                "total_food_budget": food_base * 0.6 * duration_days,
                "total_food_luxury": food_base * 2 * duration_days,
                "dining_recommendations": [
                    f"Local restaurants in {destination}: $15-25 per meal",
                    f"Fine dining in {destination}: $50-100 per meal"
                ]
            },
            "activities": {
                "daily_activity_budget": activity_base,
                "total_activities": activity_base * duration_days,
                "must_see_attractions": [
                    {"name": f"Top {destination} attraction", "cost": activity_base},
                    {"name": f"Cultural {destination} site", "cost": activity_base * 0.7}
                ],
                "free_activities": [f"Walking tours in {destination}", f"Public parks and beaches"]
            },
            "shopping": {
                "souvenirs_budget": 150,
                "luxury_shopping": 500,
                "local_markets": 100
            },
            "miscellaneous": {
                "emergency_fund": duration_days * 50,
                "tips_gratuities": duration_days * 20,
                "phone_internet": 50
            },
            "total_estimates": {
                "budget_total": int((accommodation_base * 0.5 + food_base * 0.6 + activity_base + transport_base) * duration_days + 250),
                "mid_range_total": int((accommodation_base + food_base + activity_base + transport_base) * duration_days + 400),
                "luxury_total": int((accommodation_base * 2.5 + food_base * 2 + activity_base * 1.5 + transport_base * 1.5) * duration_days + 700)
            },
            "daily_breakdown": {
                "budget_per_day": int(accommodation_base * 0.5 + food_base * 0.6 + activity_base + transport_base),
                "luxury_per_day": int(accommodation_base * 2.5 + food_base * 2 + activity_base * 1.5 + transport_base * 1.5)
            },
            "money_saving_tips": [
                "Book accommodations well in advance for better rates",
                "Use public transportation instead of taxis",
                "Eat at local restaurants and street food vendors",
                "Look for free walking tours and public attractions",
                "Travel during shoulder season for lower prices"
            ],
            "currency_info": {
                "local_currency": "Local currency",
                "exchange_rate_usd": 1.0,
                "payment_methods": ["Cash", "Credit Cards", "Mobile Payments"]
            }
        }
