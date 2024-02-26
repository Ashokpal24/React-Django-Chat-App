from rest_framework import serializers
from .models import (User, Room, Message)


class UserRegisterationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        style={'input_type', 'password'},
        write_only=True
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password mismatched"
            )
        return attrs

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)  # type: ignore


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = User
        fields = ["email", "password"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", 'email']


class MessageDetailedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        field = ["id", "user", "room", "content", "date_added"]
        ordering = ('date_added')


class MessageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        field = ["id", "user", "content"]
        ordering = ('date_added')
