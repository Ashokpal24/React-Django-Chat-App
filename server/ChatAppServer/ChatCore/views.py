from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .serializer import (
    UserRegisterationSerializer,
    UserLoginSerializer,
    UserProfileSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import User


def get_token_from_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)  # type: ignore
    }


class UserRegisterationView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegisterationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # print("validated")
        user = serializer.save()
        token = get_token_from_user(user)
        return Response(
            {
                "Token": token,
                "Msg": "Registration Success!"
            },
            status=status.HTTP_201_CREATED
        )


class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.data.get('username')  # type: ignore
        password = serializer.data.get('password')  # type: ignore
        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"Error": ["Email or password is not valid!"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = get_token_from_user(user)
        return Response(
            {
                "Token": token,
                "Msg": "Login Success!"
            },
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
