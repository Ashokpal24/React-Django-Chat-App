from django.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser
)


class UserManager(BaseUserManager):
    def create_user(self, name, password=None, password2=None):
        if not name:
            raise ValueError("User must have username")
        user = self.model(name=name)

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None):
        user = self.create_user(
            name=name,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    name = models.CharField(max_length=255)

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return f'Username: {self.name}'

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin
