import jwt
import logging
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


class CustomJWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        authorization_header = request.headers.get('Authorization')
        if authorization_header is None:
            return self.get_response(request)
        try:
            auth_method, jwt_token = authorization_header.split(' ')
            if auth_method.lower() != 'bearer':
                raise ValueError("Invalid authentication method")
            decoded_token = jwt.decode(
                jwt_token, options={"verify_signature": False})
            # logger.debug("Decoded Token: "+str(decoded_token))
            session_key_from_token = decoded_token.get('session_key')
            logger.debug("Session Key "+str(session_key_from_token))
        except Exception as e:
            return Response(
                {"message": "Error in middleware"},
                status.HTTP_400_BAD_REQUEST)

        return self.get_response(request)
