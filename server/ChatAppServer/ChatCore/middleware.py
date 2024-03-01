from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

logger = logging.getLogger(__name__)


class CustomJWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        jwt_authenticator = JWTAuthentication()

        authorization_header = request.headers.get('Authorization')
        if authorization_header is None:
            return self.get_response(request)

        user, token = jwt_authenticator.authenticate(request)
        logger.debug(user, token)

        return self.get_response(request)
