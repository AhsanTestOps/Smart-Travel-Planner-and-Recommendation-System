from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import Trip
from .serializers import TripSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_trip(request):
    """
    Create a new trip for the authenticated user
    """
    try:
        # Debug: Print request details
        print(f"CREATE TRIP DEBUG: Request method: {request.method}")
        print(f"CREATE TRIP DEBUG: Request headers: {dict(request.headers)}")
        print(f"CREATE TRIP DEBUG: User authenticated: {request.user.is_authenticated}")
        print(f"CREATE TRIP DEBUG: User: {request.user}")
        print(f"CREATE TRIP DEBUG: User ID: {getattr(request.user, 'id', 'None')}")
        
        # Use request.data instead of json.loads(request.body)
        data = request.data
        
        serializer = TripSerializer(data=data)
        if serializer.is_valid():
            trip = serializer.save(user=request.user)
            return Response({
                'success': True,
                'message': 'Trip created successfully',
                'trip': TripSerializer(trip).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error creating trip: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trips(request):
    """
    Get all trips for the authenticated user
    """
    try:
        # Debug: Print request details
        print(f"TRIPS DEBUG: Request method: {request.method}")
        print(f"TRIPS DEBUG: Request headers: {dict(request.headers)}")
        print(f"TRIPS DEBUG: User authenticated: {request.user.is_authenticated}")
        print(f"TRIPS DEBUG: User: {request.user}")
        print(f"TRIPS DEBUG: User ID: {getattr(request.user, 'id', 'None')}")
            
        trips = Trip.objects.filter(user=request.user)
        serializer = TripSerializer(trips, many=True)
        return Response({
            'success': True,
            'trips': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trip_detail(request, trip_id):
    """
    Get details of a specific trip
    """
    try:            
        trip = Trip.objects.get(id=trip_id, user=request.user)
        serializer = TripSerializer(trip)
        return Response({
            'success': True,
            'trip': serializer.data
        }, status=status.HTTP_200_OK)
    except Trip.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
