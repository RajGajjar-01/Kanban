"""
Custom permissions for Kanban Board API
"""

from rest_framework import permissions

from . import models


class IsWorkspaceOwner(permissions.BasePermission):
    """
    Permission to only allow workspace owners to edit/delete workspaces
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for workspace owner
        return obj.created_by == request.user


class IsBoardMember(permissions.BasePermission):
    """
    Permission to only allow board members to access board
    """

    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the board
        return models.BoardMember.objects.filter(board=obj, user=request.user).exists()


class IsWorkspaceMember(permissions.BasePermission):
    """
    Permission to check if user is a member of workspace (through boards)
    """

    def has_object_permission(self, request, view, obj):
        # Check if user created the workspace
        if obj.created_by == request.user:
            return True

        # Check if user is member of any board in this workspace
        return models.BoardMember.objects.filter(board__workspace=obj, user=request.user).exists()


class IsCardMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the board that contains the card
    """

    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the board containing this card
        return models.BoardMember.objects.filter(board=obj.list_id.board, user=request.user).exists()
