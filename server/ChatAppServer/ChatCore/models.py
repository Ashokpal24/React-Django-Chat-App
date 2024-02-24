from django.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser
)


class UserManager(BaseUserManager):
    def create_user(self, name, email, password=None, password2=None):

        user = self.model(
            name=name,
            email=email
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, email, password=None):
        user = self.create_user(
            name=name,
            email=email,
            password=password
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    name = models.CharField(
        verbose_name="Name",
        max_length=255,
        blank=False
    )
    email = models.EmailField(
        verbose_name="Email",
        max_length=255,
        blank=False,
        unique=True
    )
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    def __str__(self):
        return f"Name: {self.name}\n Is Active: {self.is_active}\n Email: {self.email}"

    def has_perm(self, perm, obj=None):
        return self.is_admin
