from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from .serializers import UserRegistrationSerializer, UserLoginSerializer
import json


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request):
    """
    Register a new user
    """
    try:
        data = json.loads(request.body)
        serializer = UserRegistrationSerializer(data=data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Set the last_login to now for new registrations
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Create or get token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            user_data = {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'name': user.first_name,
                'initials': user.first_name[:2].upper() if user.first_name else user.email[:2].upper(),
                'joinedAt': user.date_joined.isoformat(),
                'lastLogin': user.last_login.isoformat() if user.last_login else None,
            }
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': user_data,
                'token': token.key  # Return the token
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except json.JSONDecodeError:
        return Response({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """
    Login a user and return authentication token
    """
    try:
        print(f"LOGIN DEBUG: Received request method: {request.method}")
        print(f"LOGIN DEBUG: Request headers: {dict(request.headers)}")
        print(f"LOGIN DEBUG: Request body: {request.body}")
        
        data = json.loads(request.body)
        print(f"LOGIN DEBUG: Parsed data: {data}")
        
        # Authenticate user manually
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                print(f"LOGIN DEBUG: User found and password correct: {user}")
                
                # Update last_login field manually since we're not using Django's login()
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                
                # Create or get token for the user
                token, created = Token.objects.get_or_create(user=user)
                print(f"LOGIN DEBUG: Token created/retrieved: {token.key}")
                
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'name': user.first_name,
                    'initials': user.first_name[:2].upper() if user.first_name else user.email[:2].upper(),
                    'joinedAt': user.date_joined.isoformat(),
                    'lastLogin': user.last_login.isoformat() if user.last_login else None,
                }
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'user': user_data,
                    'token': token.key  # Return the token
                }, status=status.HTTP_200_OK)
            else:
                print(f"LOGIN DEBUG: Incorrect password for user: {user}")
                return Response({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            print(f"LOGIN DEBUG: User with email {email} does not exist")
            return Response({
                'success': False,
                'error': 'Invalid email or password'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except json.JSONDecodeError:
        return Response({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"LOGIN DEBUG: Exception occurred: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    """
    Logout a user by deleting their token
    """
    try:
        # Get token from request
        if request.user.is_authenticated:
            # Delete the user's token
            Token.objects.filter(user=request.user).delete()
            
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth(request):
    """
    Check if user is authenticated via token
    """
    print(f"CHECK AUTH DEBUG: Request method: {request.method}")
    print(f"CHECK AUTH DEBUG: Request headers: {dict(request.headers)}")
    print(f"CHECK AUTH DEBUG: User authenticated: {request.user.is_authenticated}")
    print(f"CHECK AUTH DEBUG: User: {request.user}")
    
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'username': request.user.username,
                'name': request.user.first_name,
                'initials': request.user.first_name[:2].upper() if request.user.first_name else request.user.email[:2].upper(),
                'joinedAt': request.user.date_joined.isoformat(),
                'lastLogin': request.user.last_login.isoformat() if request.user.last_login else None,
            }
        })
    else:
        return Response({
            'authenticated': False,
            'user': None
        })
