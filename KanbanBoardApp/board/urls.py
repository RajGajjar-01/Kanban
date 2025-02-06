from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_view, name='board-landing'),
    path('home/', views.home_view, name='board-home'),
    path('contact/', views.contact_view, name='board-contact'),
    path('success/', views.contact_success_view)
]   
