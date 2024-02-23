from django.contrib import admin
from django.urls import path, include
from ChatCore import urls as chatcore_urls
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(chatcore_urls))
]
