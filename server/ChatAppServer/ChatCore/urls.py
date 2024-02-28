from django.urls import path
from ChatCore.views import (
    UserRegisterationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    UserListView,
    MessageListView
)

urlpatterns = [
    path('register/', UserRegisterationView.as_view(), name="Registeration"),
    path('login/', UserLoginView.as_view(), name="Login"),
    path('logout/', UserLogoutView.as_view(), name="Logout"),
    path('profile/', UserProfileView.as_view(), name="Profile"),
    path('users/', UserListView.as_view(), name="User List"),
    path('message/<str:slug>', MessageListView.as_view(), name="Message")
]
