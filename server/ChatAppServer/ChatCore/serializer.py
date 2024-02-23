from rest_framework import serializers
from .models import User


class UserRegisterationSerializer(serializers.ModelSerializer):

    password2 = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )

    class Meta:
        model = User
        fields = ['name', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        name = attrs.get('name')
        password = attrs.get('password')
        password2 = attrs.get('password2')
        print(name, password, password2)
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm password doesn't match")
        return attrs

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)


class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'password']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'password']
