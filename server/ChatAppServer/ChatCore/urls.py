from django.urls import path
from ChatCore.views import (
    UserRegisterationView,
    UserLoginView,
    UserProfileView
)

urlpatterns = [
    path('register/', UserRegisterationView.as_view(), name="Registeration"),
    path('login/', UserLoginView.as_view(), name="Login"),
    path('profile/', UserProfileView.as_view(), name="Profile")

]
