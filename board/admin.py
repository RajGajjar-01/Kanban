from django.contrib import admin

from .models import (
    Board,
    BoardMember,
    Card,
    CardActivity,
    CardAttachment,
    CardMember,
    Comment,
    List,
    Workspace,
)


class BoardAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_date", "workspace"]


class BoardMemberAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "board"]


class WorkspaceAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "workspace_name",
        "created_by",
        "board_list",
        "created_date",
    ]


class CardAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "list_id",
        "card_name",
        "card_description",
        "created_date",
    ]


class CardMemberAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "card", "added_date"]


class ListAdmin(admin.ModelAdmin):
    list_display = ["id", "board", "list_name", "list_position"]


class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "card", "created_date", "updated_date"]
    list_filter = ["created_date", "user"]
    search_fields = ["content", "user__username", "card__card_name"]


class ActivityAdmin(admin.ModelAdmin):
    list_display = ["user", "card", "activity", "created_date"]


class AttachmentAdmin(admin.ModelAdmin):
    list_display = ["card", "uploaded_date", "name", "location"]


admin.site.register(Board, BoardAdmin)
admin.site.register(BoardMember, BoardMemberAdmin)
admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(List, ListAdmin)
admin.site.register(Card, CardAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(CardActivity, ActivityAdmin)
admin.site.register(CardAttachment, AttachmentAdmin)
admin.site.register(CardMember, CardMemberAdmin)
