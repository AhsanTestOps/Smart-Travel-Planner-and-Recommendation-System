from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import FreeTrip
from .serializers import FreeTripSerializer
import uuid
import json

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def create_free_trip(request):
    """
    Create a new free trip (no authentication required)
    """
    try:
        print(f"FREE TRIP DEBUG: Received request method: {request.method}")
        print(f"FREE TRIP DEBUG: Request headers: {dict(request.headers)}")
        print(f"FREE TRIP DEBUG: Received data: {request.data}")
        
        data = request.data.copy()
        
        # Validate required fields
        required_fields = ['destination', 'start_date', 'end_date']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a session ID if not provided
        if not data.get('session_id'):
            data['session_id'] = str(uuid.uuid4())
        
        # Ensure adults is at least 1
        if not data.get('adults') or data.get('adults') < 1:
            data['adults'] = 1
            
        # Set default values for optional fields
        if not data.get('children'):
            data['children'] = 0
        if not data.get('budget'):
            data['budget'] = 1000
        if not data.get('currency'):
            data['currency'] = 'USD'
        
        serializer = FreeTripSerializer(data=data)
        if serializer.is_valid():
            free_trip = serializer.save()
            
            print(f"FREE TRIP DEBUG: Created trip with ID: {free_trip.id}")
            
            return Response({
                'success': True,
                'message': 'Free trip created successfully',
                'trip': FreeTripSerializer(free_trip).data
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"FREE TRIP DEBUG: Validation errors: {serializer.errors}")
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        import traceback
        print(f"FREE TRIP DEBUG: Exception occurred: {str(e)}")
        print(f"FREE TRIP DEBUG: Traceback: {traceback.format_exc()}")
        return Response({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_free_trips_by_session(request, session_id):
    """
    Get all free trips for a specific session (to show on map)
    """
    try:
        print(f"FREE TRIP DEBUG: Getting trips for session: {session_id}")
        
        if not session_id:
            return Response({
                'success': False,
                'error': 'Session ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        trips = FreeTrip.objects.filter(session_id=session_id, is_active=True)
        serializer = FreeTripSerializer(trips, many=True)
        
        print(f"FREE TRIP DEBUG: Found {trips.count()} trips for session {session_id}")
        
        return Response({
            'success': True,
            'trips': serializer.data,
            'count': trips.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"FREE TRIP DEBUG: Error fetching trips: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_all_free_trips(request):
    """
    Get all free trips (for admin purposes or general display)
    """
    try:
        trips = FreeTrip.objects.filter(is_active=True).order_by('-created_at')[:50]  # Limit to recent 50
        serializer = FreeTripSerializer(trips, many=True)
        
        return Response({
            'success': True,
            'trips': serializer.data,
            'count': trips.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_free_trip_detail(request, trip_id):
    """
    Get details of a specific free trip
    """
    try:
        trip = FreeTrip.objects.get(id=trip_id, is_active=True)
        serializer = FreeTripSerializer(trip)
        
        return Response({
            'success': True,
            'trip': serializer.data
        }, status=status.HTTP_200_OK)
        
    except FreeTrip.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
@csrf_exempt
def update_free_trip(request, trip_id):
    """
    Update a free trip
    """
    try:
        trip = FreeTrip.objects.get(id=trip_id, is_active=True)
        serializer = FreeTripSerializer(trip, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_trip = serializer.save()
            return Response({
                'success': True,
                'message': 'Trip updated successfully',
                'trip': FreeTripSerializer(updated_trip).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except FreeTrip.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
