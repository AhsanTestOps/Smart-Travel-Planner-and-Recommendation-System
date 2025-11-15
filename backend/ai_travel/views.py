from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
import time
import logging

from .models import AIItinerary, BudgetEstimate, AIGenerationLog
from .serializers import (
    AIItineraryCreateSerializer, AIItinerarySerializer, 
    AIItineraryListSerializer, BudgetEstimateSerializer,
    ItineraryRequestSerializer, BudgetRequestSerializer
)
from .services import AIService

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_ai_itinerary(request):
    """Generate AI-powered travel itinerary"""
    print("=== AI ITINERARY DEBUG START ===")
    print("Received request method:", request.method)
    print("Request headers:", dict(request.headers))
    print("Request data:", request.data)
    print("Request content type:", request.content_type)
    
    try:
        # Validate request data
        serializer = ItineraryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print("AI ITINERARY DEBUG: Validation errors:", serializer.errors)
            return Response({
                'success': False,
                'error': 'Invalid request data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        print("AI ITINERARY DEBUG: Validated data:", validated_data)
        
        # Initialize AI service
        try:
            print("AI ITINERARY DEBUG: Initializing AI service...")
            ai_service = AIService()
            print(f"AI ITINERARY DEBUG: AI service initialized")
        except ValueError as e:
            print("AI ITINERARY DEBUG: AI service initialization error:", str(e))
            return Response({
                'success': False,
                'error': 'AI service not available',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print("AI ITINERARY DEBUG: Unexpected error initializing AI service:", str(e))
            return Response({
                'success': False,
                'error': 'AI service initialization failed',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Generate itinerary using AI
        try:
            print("AI ITINERARY DEBUG: Starting itinerary generation...")
            
            # Use concurrent generation for faster performance
            itinerary_content, budget_content, generation_time = ai_service.generate_complete_trip(validated_data)
            
            print(f"AI ITINERARY DEBUG: Generated complete trip in {generation_time:.2f} seconds")
            
            # Handle budget generation error if it occurred
            if budget_content is None or 'error' in budget_content:
                print("AI ITINERARY DEBUG: Budget generation had issues, using fallback")
                budget_content = {"error": "Budget generation failed"}
                budget_gen_time = 0
            else:
                budget_gen_time = 0  # Already included in generation_time
                
        except Exception as e:
            print("AI ITINERARY DEBUG: Error generating itinerary:", str(e))
            import traceback
            print("AI ITINERARY DEBUG: Full traceback:", traceback.format_exc())
            return Response({
                'success': False,
                'error': 'Failed to generate itinerary',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Format the itinerary response for frontend display
        def format_itinerary_for_frontend(itinerary_content):
            """Convert AI response to frontend-expected format"""
            
            try:
                # Handle new detailed format from enhanced AI service
                if 'itinerary_content' in itinerary_content:
                    content = itinerary_content['itinerary_content']
                    
                    # Extract daily schedule - handle both new and old formats
                    daily_schedule = []
                    
                    if 'daily_schedule' in content:
                        # New enhanced format
                        for day_info in content['daily_schedule']:
                            activities = []
                            
                            # Convert activities to expected format
                            for activity in day_info.get('activities', []):
                                activities.append({
                                    'time': activity.get('time', ''),
                                    'activity': activity.get('activity', ''),
                                    'description': activity.get('description', ''),
                                    'location': activity.get('location', ''),
                                    'estimated_cost': activity.get('estimated_cost', 0),
                                    'type': activity.get('type', 'activity'),
                                    'duration': activity.get('duration', ''),
                                    'tips': activity.get('tips', ''),
                                    'cultural_context': activity.get('why_special', ''),
                                    'photo_opportunity': activity.get('tips', '')
                                })
                            
                            daily_schedule.append({
                                'date': day_info.get('date', ''),
                                'theme': day_info.get('theme', day_info.get('title', '')),
                                'activities': activities,
                                'dining_recommendations': day_info.get('dining_recommendations', []),
                                'daily_cost_estimate': day_info.get('daily_cost_estimate', 0),
                                'weather_note': day_info.get('weather_note', '')
                            })
                    
                    # Handle budget breakdown - both formats
                    budget_breakdown = content.get('detailed_budget_breakdown', content.get('budget_breakdown', {}))
                    
                    # Handle recommendations - both formats
                    recommendations = content.get('recommendations', {})
                    if 'expert_recommendations' in content:
                        expert_recs = content['expert_recommendations']
                        recommendations.update({
                            'local_etiquette': expert_recs.get('cultural_etiquette', []),
                            'must_try_restaurants': expert_recs.get('must_try_restaurants', []),
                            'unique_experiences': expert_recs.get('unique_experiences', []),
                            'best_shopping': expert_recs.get('best_shopping', []),
                            'transportation_guide': expert_recs.get('transportation_guide', [])
                        })
                    
                    # Handle practical information
                    practical_info = content.get('practical_information', {})
                    
                    return {
                        'overview': content.get('overview', 'Generated travel itinerary'),
                        'total_estimated_cost': content.get('total_estimated_cost', 0),
                        'budget_breakdown': budget_breakdown,
                        'daily_schedule': daily_schedule,
                        'recommendations': recommendations,
                        'practical_information': practical_info,
                        'seasonal_notes': content.get('seasonal_notes', ''),
                        'budget_tips': content.get('budget_tips', []),
                        'packing_suggestions': practical_info.get('packing_essentials', content.get('packing_suggestions', [])),
                        'best_photo_spots': practical_info.get('photography_spots', content.get('best_photo_spots', [])),
                        'local_phrases': practical_info.get('useful_phrases', content.get('local_phrases', {})),
                        'emergency_info': practical_info.get('emergency_contacts', content.get('emergency_info', {})),
                        'images': content.get('images', [])
                    }
                
                # Handle legacy format or direct itinerary structure
                elif 'itinerary' in itinerary_content and itinerary_content['itinerary']:
                    ai_itinerary = itinerary_content['itinerary']
                    
                    # Convert day-by-day structure to daily_schedule format
                    daily_schedule = []
                    
                    for day_key in sorted(ai_itinerary.keys()):
                        if day_key.startswith('day'):
                            day_data = ai_itinerary[day_key]
                            
                            # Create activities list from the day structure
                            activities = []
                            
                            for time_period in ['morning', 'midday', 'afternoon', 'evening', 'night']:
                                if time_period in day_data and isinstance(day_data[time_period], dict):
                                    activity_data = day_data[time_period]
                                    activities.append({
                                        'time': activity_data.get('time', ''),
                                        'activity': activity_data.get('activity', ''),
                                        'description': activity_data.get('notes', activity_data.get('description', '')),
                                        'location': activity_data.get('location', ''),
                                        'estimated_cost': activity_data.get('cost', ''),
                                        'type': 'activity',
                                        'cultural_context': activity_data.get('culturalContext', ''),
                                        'photo_opportunity': activity_data.get('photoOpportunity', '')
                                    })
                            
                            # Calculate day number and date
                            day_number = int(day_key.replace('day', ''))
                            start_date = validated_data.get('start_date')
                            if start_date:
                                from datetime import datetime, timedelta
                                day_date = start_date + timedelta(days=day_number - 1)
                            else:
                                day_date = None
                            
                            daily_schedule.append({
                                'date': day_date.isoformat() if day_date else f"Day {day_number}",
                                'theme': day_data.get('theme', f"Day {day_number}"),
                                'activities': activities
                            })
                    
                    # Handle images safely
                    images = []
                    if 'images' in itinerary_content:
                        images_data = itinerary_content['images']
                        if isinstance(images_data, dict) and 'gallery' in images_data:
                            gallery = images_data['gallery']
                            if isinstance(gallery, list):
                                images = gallery
                    
                    return {
                        'overview': itinerary_content.get('destination_overview', itinerary_content.get('tripName', '')),
                        'daily_schedule': daily_schedule,
                        'recommendations': {
                            'local_etiquette': itinerary_content.get('localEtiquette', {}) if isinstance(itinerary_content.get('localEtiquette'), dict) else {},
                            'useful_phrases': itinerary_content.get('usefulPhrases', {}) if isinstance(itinerary_content.get('usefulPhrases'), dict) else {},
                            'cultural_tips': itinerary_content.get('culturalTips', []) if isinstance(itinerary_content.get('culturalTips'), list) else []
                        },
                        'images': images
                    }
                
                # Fallback for other formats
                return {
                    'overview': itinerary_content.get('overview', itinerary_content.get('destination_overview', 'Generated travel itinerary')),
                    'daily_schedule': itinerary_content.get('daily_schedule', []) if isinstance(itinerary_content.get('daily_schedule'), list) else [],
                    'recommendations': itinerary_content.get('recommendations', {}) if isinstance(itinerary_content.get('recommendations'), dict) else {},
                    'total_estimated_cost': itinerary_content.get('total_estimated_cost', 0),
                    'budget_breakdown': itinerary_content.get('budget_breakdown', itinerary_content.get('detailed_budget_breakdown', {})),
                    'images': []
                }
            except Exception as format_error:
                print(f"❌ Error in format_itinerary_for_frontend: {format_error}")
                import traceback
                print(f"Format error traceback: {traceback.format_exc()}")
                
                # Return safe fallback
                return {
                    'overview': 'Generated travel itinerary',
                    'daily_schedule': [],
                    'recommendations': {},
                    'images': []
                }
        
        # Format the itinerary content for frontend
        formatted_itinerary = format_itinerary_for_frontend(itinerary_content)
        
        # DEBUG: Print what we got from AI
        print("🔍 DEBUG: Checking recommendations in itinerary_content")
        if 'itinerary_content' in itinerary_content:
            print("✅ Has itinerary_content wrapper")
            recs = itinerary_content['itinerary_content'].get('recommendations', {})
            print(f"📋 Recommendations keys: {list(recs.keys())}")
            print(f"💰 Budget tips: {len(recs.get('budget_tips', []))} items")
            print(f"🎭 Cultural tips: {len(recs.get('cultural_tips', []))} items")
            print(f"🍜 Local cuisine: {len(recs.get('local_cuisine', []))} items")
        else:
            print("⚠️ No itinerary_content wrapper found")
        
        print("🔍 DEBUG: Formatted itinerary recommendations")
        formatted_recs = formatted_itinerary.get('recommendations', {})
        print(f"📋 Formatted recommendations keys: {list(formatted_recs.keys())}")
        print(f"💰 Formatted budget tips: {len(formatted_recs.get('budget_tips', []))} items")
        print(f"🎭 Formatted cultural tips: {len(formatted_recs.get('cultural_tips', []))} items")
        print(f"🍜 Formatted local cuisine: {len(formatted_recs.get('local_cuisine', []))} items")
        
        # IMPORTANT: Merge budget data into itinerary content for frontend display
        if 'error' not in budget_content and isinstance(budget_content, dict):
            # Add budget breakdown to the formatted itinerary content
            if 'budget_breakdown' not in formatted_itinerary or not formatted_itinerary['budget_breakdown']:
                formatted_itinerary['budget_breakdown'] = budget_content
                
            # Ensure total cost is properly set from budget if not already present
            if ('total_estimated_cost' not in formatted_itinerary or 
                formatted_itinerary['total_estimated_cost'] == 0):
                total_estimates = budget_content.get('total_estimates', {})
                if 'luxury_total' in total_estimates:
                    formatted_itinerary['total_estimated_cost'] = total_estimates['luxury_total']
                elif 'budget_total' in total_estimates:
                    formatted_itinerary['total_estimated_cost'] = total_estimates['budget_total']
        
        # Prepare data for database storage
        itinerary_data = validated_data.copy()
        
        # Convert interests list to comma-separated string for model storage
        if 'interests' in itinerary_data and isinstance(itinerary_data['interests'], list):
            itinerary_data['interests'] = ', '.join(itinerary_data['interests'])
        
        itinerary_data.update({
            'user': request.user.id if request.user.is_authenticated else None,
            'itinerary_content': formatted_itinerary,  # Use formatted version
            'budget_breakdown': budget_content,
            'generation_time': generation_time + budget_gen_time,
            'recommendations': formatted_itinerary.get('recommendations', [])
        })
        
        # Save to database
        itinerary_serializer = AIItineraryCreateSerializer(data=itinerary_data)
        if not itinerary_serializer.is_valid():
            print("AI ITINERARY DEBUG: Database save validation errors:", itinerary_serializer.errors)
            return Response({
                'success': False,
                'error': 'Failed to save itinerary',
                'details': itinerary_serializer.errors
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        itinerary = itinerary_serializer.save()
        print("AI ITINERARY DEBUG: Saved itinerary with ID:", itinerary.id)
        
        # Create detailed budget estimate if budget generation was successful
        if 'error' not in budget_content:
            try:
                budget_estimate = BudgetEstimate.objects.create(
                    itinerary=itinerary,
                    accommodation_min=budget_content.get('accommodation', {}).get('budget_min', 0),
                    accommodation_max=budget_content.get('accommodation', {}).get('budget_max', 0),
                    accommodation_recommendations=budget_content.get('accommodation', {}).get('recommendations', []),
                    transportation_min=budget_content.get('transportation', {}).get('local', {}).get('daily_transport', 0) * validated_data['duration_days'],
                    transportation_max=budget_content.get('transportation', {}).get('local', {}).get('daily_transport', 0) * validated_data['duration_days'] * 1.5,
                    transportation_breakdown=budget_content.get('transportation', {}),
                    food_min=budget_content.get('food', {}).get('budget_daily', 0) * validated_data['duration_days'],
                    food_max=budget_content.get('food', {}).get('luxury_daily', 0) * validated_data['duration_days'],
                    dining_recommendations=budget_content.get('food', {}).get('dining_recommendations', []),
                    activities_min=budget_content.get('activities', {}).get('daily_activity_budget', 0) * validated_data['duration_days'],
                    activities_max=budget_content.get('activities', {}).get('daily_activity_budget', 0) * validated_data['duration_days'] * 1.5,
                    activities_breakdown=budget_content.get('activities', {}).get('must_see_attractions', []),
                    shopping_min=budget_content.get('shopping', {}).get('souvenirs', 0),
                    shopping_max=budget_content.get('shopping', {}).get('souvenirs', 0) * 2,
                    miscellaneous=budget_content.get('miscellaneous', {}).get('emergency_fund', 0),
                    emergency_fund=budget_content.get('miscellaneous', {}).get('emergency_fund', 0),
                    total_min=budget_content.get('total_estimates', {}).get('budget_total', 0),
                    total_max=budget_content.get('total_estimates', {}).get('luxury_total', 0),
                    budget_alternatives=budget_content.get('budget_alternatives', []),
                    luxury_alternatives=budget_content.get('luxury_upgrades', [])
                )
                print("AI ITINERARY DEBUG: Created detailed budget estimate")
            except Exception as e:
                print("AI ITINERARY DEBUG: Error creating detailed budget:", str(e))
        
        # Log the generation
        AIGenerationLog.objects.create(
            itinerary=itinerary,
            request_type='itinerary',
            prompt_sent=f"Generated itinerary for {validated_data['destination']}",
            response_received=str(itinerary_content)[:1000],  # Truncate for storage
            response_time=generation_time,
            success=True
        )
        
        # Return response
        response_serializer = AIItinerarySerializer(itinerary)
        return Response({
            'success': True,
            'message': 'AI itinerary generated successfully',
            'itinerary': response_serializer.data,
            'generation_time': round(generation_time, 2),
            'performance': {
                'total_time': round(generation_time, 2),
                'speed': 'fast' if generation_time < 5 else 'normal'
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("=== AI ITINERARY CRITICAL ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Full traceback:\n{traceback.format_exc()}")
        print("=== END ERROR DEBUG ===")
        
        logger.error(f"Unexpected error in generate_ai_itinerary: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e),
            'error_type': type(e).__name__
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ai_itinerary(request, itinerary_id):
    """Get a specific AI itinerary by ID"""
    print("GET AI ITINERARY DEBUG: Retrieving itinerary:", itinerary_id)
    
    try:
        itinerary = get_object_or_404(AIItinerary, id=itinerary_id)
        
        # Check permission - allow if user owns it or it's anonymous
        if itinerary.user and itinerary.user != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AIItinerarySerializer(itinerary)
        return Response({
            'success': True,
            'itinerary': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("GET AI ITINERARY DEBUG: Error:", str(e))
        return Response({
            'success': False,
            'error': 'Failed to retrieve itinerary',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_itineraries(request):
    """List all itineraries for authenticated user"""
    print("LIST ITINERARIES DEBUG: User:", request.user)
    
    try:
        itineraries = AIItinerary.objects.filter(user=request.user).order_by('-created_at')
        serializer = AIItineraryListSerializer(itineraries, many=True)
        
        return Response({
            'success': True,
            'itineraries': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("LIST ITINERARIES DEBUG: Error:", str(e))
        return Response({
            'success': False,
            'error': 'Failed to retrieve itineraries',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_session_itineraries(request, session_id):
    """List all itineraries for a session (for anonymous users)"""
    print("SESSION ITINERARIES DEBUG: Session ID:", session_id)
    
    try:
        itineraries = AIItinerary.objects.filter(
            session_id=session_id,
            user__isnull=True
        ).order_by('-created_at')
        
        serializer = AIItineraryListSerializer(itineraries, many=True)
        
        return Response({
            'success': True,
            'itineraries': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("SESSION ITINERARIES DEBUG: Error:", str(e))
        return Response({
            'success': False,
            'error': 'Failed to retrieve session itineraries',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def regenerate_budget(request):
    """Regenerate budget estimate for an existing itinerary"""
    print("REGENERATE BUDGET DEBUG: Request data:", request.data)
    
    try:
        serializer = BudgetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid request data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        itinerary_id = serializer.validated_data['itinerary_id']
        itinerary = get_object_or_404(AIItinerary, id=itinerary_id)
        
        # Check permission
        if itinerary.user and itinerary.user != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prepare trip data for AI service
        trip_data = {
            'destination': itinerary.destination,
            'duration_days': itinerary.duration_days,
            'adults': itinerary.adults,
            'children': itinerary.children,
            'budget': itinerary.budget,
            'currency': itinerary.currency,
            'travel_style': itinerary.travel_style,
            'interests': itinerary.interests
        }
        
        # Generate new budget estimate
        try:
            ai_service = AIService()
            budget_content, generation_time = ai_service.generate_budget_estimate(trip_data)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to generate budget estimate',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Update the itinerary
        itinerary.budget_breakdown = budget_content
        itinerary.save()
        
        # Update or create detailed budget estimate
        budget_estimate, created = BudgetEstimate.objects.get_or_create(
            itinerary=itinerary,
            defaults={
                'accommodation_min': budget_content.get('accommodation', {}).get('budget_min', 0),
                'accommodation_max': budget_content.get('accommodation', {}).get('budget_max', 0),
                'transportation_min': budget_content.get('transportation', {}).get('local', {}).get('daily_transport', 0) * itinerary.duration_days,
                'transportation_max': budget_content.get('transportation', {}).get('local', {}).get('daily_transport', 0) * itinerary.duration_days * 1.5,
                'food_min': budget_content.get('food', {}).get('budget_daily', 0) * itinerary.duration_days,
                'food_max': budget_content.get('food', {}).get('luxury_daily', 0) * itinerary.duration_days,
                'activities_min': budget_content.get('activities', {}).get('daily_activity_budget', 0) * itinerary.duration_days,
                'activities_max': budget_content.get('activities', {}).get('daily_activity_budget', 0) * itinerary.duration_days * 1.5,
                'total_min': budget_content.get('total_estimates', {}).get('budget_total', 0),
                'total_max': budget_content.get('total_estimates', {}).get('luxury_total', 0),
            }
        )
        
        if not created:
            # Update existing budget estimate
            for field, value in {
                'accommodation_min': budget_content.get('accommodation', {}).get('budget_min', 0),
                'accommodation_max': budget_content.get('accommodation', {}).get('budget_max', 0),
                'total_min': budget_content.get('total_estimates', {}).get('budget_total', 0),
                'total_max': budget_content.get('total_estimates', {}).get('luxury_total', 0),
            }.items():
                setattr(budget_estimate, field, value)
            budget_estimate.save()
        
        # Log the regeneration
        AIGenerationLog.objects.create(
            itinerary=itinerary,
            request_type='budget',
            prompt_sent=f"Regenerated budget for {itinerary.destination}",
            response_received=str(budget_content)[:1000],
            response_time=generation_time,
            success=True
        )
        
        response_serializer = BudgetEstimateSerializer(budget_estimate)
        return Response({
            'success': True,
            'message': 'Budget estimate regenerated successfully',
            'budget': response_serializer.data,
            'generation_time': generation_time
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("REGENERATE BUDGET DEBUG: Error:", str(e))
        return Response({
            'success': False,
            'error': 'Failed to regenerate budget',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_ai_itinerary(request, itinerary_id):
    """Delete an AI itinerary"""
    print("DELETE AI ITINERARY DEBUG: Deleting itinerary:", itinerary_id)
    
    try:
        itinerary = get_object_or_404(AIItinerary, id=itinerary_id)
        
        # Check permission
        if itinerary.user and itinerary.user != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        itinerary.delete()
        
        return Response({
            'success': True,
            'message': 'Itinerary deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("DELETE AI ITINERARY DEBUG: Error:", str(e))
        return Response({
            'success': False,
            'error': 'Failed to delete itinerary',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
