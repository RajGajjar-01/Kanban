from django.urls import path
from . import views
from allauth.socialaccount.providers.google.views import oauth2_login, oauth2_callback

urlpatterns = [
    path('register/', views.register_view, name='user-register'),
    path('logout/', views.logout_view, name='user-logout'),
    path('login/', views.login_view, name='user-login'),
    path('profile/', views.profile_view, name='user-profile'),
]   


