import jwt
import logging
from django.http import JsonResponse
from rest_framework import status
from ChatCore.models import User

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

            session_key_from_token = decoded_token.get('session_key')
            # logger.debug("Session Key "+str(session_key_from_token))

            if (User.objects.get(id=decoded_token.get('user_id')).session_key != session_key_from_token):
                return JsonResponse({"message": "user logged in from new device"}, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return JsonResponse({"message": "JWT token has expired"}, status=status.HTTP_401_UNAUTHORIZED)

        except jwt.InvalidTokenError:
            return JsonResponse({"message": "Invalid JWT token"}, status=status.HTTP_401_UNAUTHORIZED)

        except ValueError as ve:
            return JsonResponse({"message": str(ve)}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            return JsonResponse({"message": "User not found"}, status=status.HTTP_401_UNAUTHORIZED)

        return self.get_response(request)
