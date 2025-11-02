"""
URL configuration for blog app.
"""

from django.urls import path

from . import views

app_name = "blog"

urlpatterns = [
    path("", views.blog_list_view, name="list"),
    path("<slug:slug>/", views.blog_detail_view, name="detail"),
    path("tag/<str:tag>/", views.blog_tag_view, name="tag"),
]
