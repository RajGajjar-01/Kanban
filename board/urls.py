from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing_view, name="board-landing"),
    path("home/", views.home_view, name="board-home"),
    path("contact/", views.contact_view, name="board-contact"),
    path("success/", views.contact_success_view),
    path(
        "workspace/<int:pk>/get-board/<int:id>/",
        views.board_data_view,
        name="get-board-by-id",
    ),
    path("api/save-workspace/", views.save_workspace_view, name="save_workspace"),
    path("api/all-workspaces/", views.get_all_workspaces_view, name="all-workspaces"),
    path(
        "api/workspace-<int:pk>/get-boards/",
        views.get_all_boards_view,
        name="get-boards-by-workspace",
    ),
    path(
        "api/workspace-<int:pk>/get-particular-boards/",
        views.get_particular_boards_view,
        name="get-boards-by-workspace",
    ),
    path(
        "api/workspace-<int:pk>/delete/",
        views.delete_workspace_view,
        name="delete-workspace-by-id",
    ),
    path(
        "api/workspace-<int:pk>/create-board/",
        views.create_board_view,
        name="create_board",
    ),
    path(
        "api/board-<int:pk>/get-lists/",
        views.api_get_lists_view,
        name="get-lists-by-board",
    ),
    path("api/board/create-list/", views.api_create_list_view, name="create_list"),
    path(
        "api/board/delete-list-<int:pk>/",
        views.api_delete_list_view,
        name="delete-list",
    ),
    path(
        "api/board-name-edit/<int:pk>/",
        views.api_board_name_edit_view,
        name="edit-board-name",
    ),
    path("api/list-<int:pk>/cards/", views.api_get_card_view, name="get-cards-by-list"),
    path("api/list/create-card/", views.api_create_card_view, name="create_card"),
    path(
        "api/destination-list-<int:id>/card-<int:pk>/",
        views.api_card_position_update_view,
        name="card-position-update",
    ),
    path(
        "api/board-<int:pk>/invite", views.api_send_invitation, name="send-invitation"
    ),
    path(
        "accept-invitation/<str:token>/",
        views.api_accept_invitation,
        name="api_accept_invitation",
    ),
    path(
        "api/workspace-<int:pk>/get-members/",
        views.api_get_members,
        name="get-members-of-workspace",
    ),
    path(
        "api/get-all-other-workspaces/",
        views.get_all_other_workspace_view,
        name="get-all-other-workspaces",
    ),
]
