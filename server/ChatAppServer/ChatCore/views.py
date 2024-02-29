from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist
from .serializer import (
    UserRegisterationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    MessageListSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import (User, Room, Message, UserSession)


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
        if not request.session.session_key:
            request.session.save()
        print(request.session.session_key)
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.data.get('email')  # type: ignore
        password = serializer.data.get('password')  # type: ignore
        user = authenticate(email=email, password=password)
        if not user:
            return Response(
                {"Error": ["Email or password is not valid!"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = get_token_from_user(user)

        UserSession.objects.create(
            user=user, session_key=request.session.session_key)

        session_count = UserSession.objects.filter(user=user).count()
        if session_count > 1:
            UserSession.objects.filter(
                session_key=request.session.session_key).delete()
            return Response(
                {"Error": ["please logout from other device"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "Token": token,
                "Msg": "Login Success!"
            },
            status=status.HTTP_200_OK
        )


class UserLogoutView(APIView):
    def get(self, request, *args, **kwargs):
        UserSession.objects.filter(user=request.user).delete()
        return Response({"Msg": "Session deleted"
                         }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_list = User.objects.all().exclude(id=request.user.id)
        if not user_list:
            return Response(
                {"message": "No User available"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserProfileSerializer(user_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug, *args, **kwargs):
        room = None
        messages = None
        try:
            room = Room.objects.get(slug=slug)
            messages = Message.objects.filter(room=room)
        except ObjectDoesNotExist:
            return Response(
                {"message": "No Message available"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = MessageListSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
