from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_view, name="user-register"),
    path("logout/", views.logout_view, name="user-logout"),
    path("login/", views.login_view, name="user-login"),
    path("profile/", views.profile_view, name="user-profile"),
]
