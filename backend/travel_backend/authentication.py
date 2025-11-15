from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom SessionAuthentication that doesn't enforce CSRF for API calls
    """
    def enforce_csrf(self, request):
        return  # Do nothing, effectively disabling CSRF for API calls
