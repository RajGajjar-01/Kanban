"""
Django REST Framework Serializers for Kanban Board API
"""

from django.contrib.auth.models import User
from rest_framework import serializers

from . import models


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id"]


class WorkspaceSerializer(serializers.ModelSerializer):
    """Serializer for Workspace model"""

    created_by = UserSerializer(read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    board_count = serializers.SerializerMethodField()

    class Meta:
        model = models.Workspace
        fields = [
            "id",
            "workspace_name",
            "created_by",
            "created_by_username",
            "created_date",
            "board_count",
        ]
        read_only_fields = ["id", "created_by", "created_date"]

    def get_board_count(self, obj):
        """Return the number of boards in this workspace"""
        return obj.board_list.count()

    def create(self, validated_data):
        """Set the created_by field to the current user"""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class WorkspaceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing workspaces"""

    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = models.Workspace
        fields = [
            "id",
            "workspace_name",
            "created_by_username",
            "created_date",
        ]
        read_only_fields = ["id", "created_date"]


class BoardMemberSerializer(serializers.ModelSerializer):
    """Serializer for BoardMember model"""

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    profile_image = serializers.SerializerMethodField()
    board_name = serializers.CharField(source="board.name", read_only=True)

    class Meta:
        model = models.BoardMember
        fields = [
            "id",
            "user",
            "username",
            "email",
            "profile_image",
            "board",
            "board_name",
        ]
        read_only_fields = ["id"]

    def get_profile_image(self, obj):
        """Get user profile image URL"""
        if hasattr(obj.user, "profile") and obj.user.profile.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.user.profile.image.url)
        return None


class BoardSerializer(serializers.ModelSerializer):
    """Serializer for Board model"""

    workspace_name = serializers.CharField(source="workspace.workspace_name", read_only=True)
    user_count = serializers.IntegerField(read_only=True)
    members = BoardMemberSerializer(source="memofboard", many=True, read_only=True)

    class Meta:
        model = models.Board
        fields = [
            "id",
            "name",
            "description",
            "background_color",
            "workspace",
            "workspace_name",
            "created_date",
            "user_count",
            "members",
        ]
        read_only_fields = ["id", "created_date", "user_count"]

    def create(self, validated_data):
        """Create board and add workspace creator as member"""
        board = super().create(validated_data)
        return board


class BoardListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing boards"""

    workspace_name = serializers.CharField(source="workspace.workspace_name", read_only=True)

    class Meta:
        model = models.Board
        fields = [
            "id",
            "name",
            "description",
            "background_color",
            "workspace",
            "workspace_name",
            "created_date",
        ]
        read_only_fields = ["id", "created_date"]


class CardSerializer(serializers.ModelSerializer):
    """Serializer for Card model"""

    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = models.Card
        fields = [
            "id",
            "card_name",
            "card_description",
            "list_id",
            "created_date",
            "due_date",
            "label",
            "member_count",
        ]
        read_only_fields = ["id", "created_date", "member_count"]


class CardListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing cards"""

    class Meta:
        model = models.Card
        fields = ["id", "card_name"]
        read_only_fields = ["id"]


class ListSerializer(serializers.ModelSerializer):
    """Serializer for List model"""

    cards = CardListSerializer(source="card_set", many=True, read_only=True)
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = models.List
        fields = [
            "id",
            "list_name",
            "list_position",
            "board",
            "cards",
            "card_count",
        ]
        read_only_fields = ["id"]

    def get_card_count(self, obj):
        """Return the number of cards in this list"""
        return obj.card_set.count()


class ListCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lists"""

    class Meta:
        model = models.List
        fields = ["id", "list_name", "list_position", "board"]
        read_only_fields = ["id"]


class CardMemberSerializer(serializers.ModelSerializer):
    """Serializer for CardMember model"""

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = models.CardMember
        fields = ["id", "user", "username", "card", "added_date"]
        read_only_fields = ["id", "added_date"]


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = models.Comment
        fields = [
            "id",
            "user",
            "username",
            "card",
            "content",
            "created_date",
            "updated_date",
        ]
        read_only_fields = ["id", "user", "created_date", "updated_date"]


class CardActivitySerializer(serializers.ModelSerializer):
    """Serializer for CardActivity model"""

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = models.CardActivity
        fields = ["id", "user", "username", "card", "activity", "created_date"]
        read_only_fields = ["id", "user", "created_date"]


class CardAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for CardAttachment model"""

    class Meta:
        model = models.CardAttachment
        fields = ["id", "card", "name", "location", "uploaded_date"]
        read_only_fields = ["id", "uploaded_date"]


class BoardInvitationSerializer(serializers.ModelSerializer):
    """Serializer for BoardInvitation model"""

    inviter_username = serializers.CharField(source="inviter.username", read_only=True)
    board_name = serializers.CharField(source="board.name", read_only=True)

    class Meta:
        model = models.BoardInvitaton
        fields = [
            "id",
            "email",
            "board",
            "board_name",
            "token",
            "inviter",
            "inviter_username",
            "created_at",
            "expires_at",
            "status",
        ]
        read_only_fields = [
            "id",
            "token",
            "created_at",
            "expires_at",
            "inviter",
        ]

    def create(self, validated_data):
        """Set the inviter to the current user"""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["inviter"] = request.user
        return super().create(validated_data)


class BoardNameUpdateSerializer(serializers.Serializer):
    """Serializer for updating board name"""

    value = serializers.CharField(max_length=255, required=True)


class CardPositionUpdateSerializer(serializers.Serializer):
    """Serializer for updating card position (moving to different list)"""

    list_id = serializers.IntegerField(required=True)
