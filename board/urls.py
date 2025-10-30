from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

# DRF Router for API ViewSets
router = DefaultRouter()
router.register(r"workspaces", views.WorkspaceViewSet, basename="workspace")
router.register(r"boards", views.BoardViewSet, basename="board")
router.register(r"lists", views.ListViewSet, basename="list")
router.register(r"cards", views.CardViewSet, basename="card")
router.register(r"board-members", views.BoardMemberViewSet, basename="boardmember")

urlpatterns = [
    # Frontend template views
    path("", views.landing_view, name="board-landing"),
    path("home/", views.home_view, name="board-home"),
    path("contact/", views.contact_view, name="board-contact"),
    path("about/", views.about_view, name="board-about"),
    path("success/", views.contact_success_view),
    path(
        "workspace/<int:pk>/get-board/<int:id>/",
        views.board_data_view,
        name="get-board-by-id",
    ),
    # Invitation acceptance (kept for email links)
    path(
        "accept-invitation/<str:token>/",
        views.api_accept_invitation,
        name="api_accept_invitation",
    ),
    # ============================================
    # Django REST Framework API (v1)
    # ============================================
    path("api/v1/", include(router.urls)),
]
