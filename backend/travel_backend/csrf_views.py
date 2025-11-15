from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods


@ensure_csrf_cookie
@require_http_methods(["GET"])
def csrf_token(request):
    """
    Get CSRF token for API calls
    """
    return JsonResponse({'csrfToken': get_token(request)})
