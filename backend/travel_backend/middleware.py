from django.utils.deprecation import MiddlewareMixin

class DisableCSRFOnAPIMiddleware(MiddlewareMixin):
    """
    Disable CSRF protection for API endpoints
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
