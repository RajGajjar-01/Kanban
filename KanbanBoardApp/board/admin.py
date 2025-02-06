from django.contrib import admin
from .models import Board, BoardMember, Workspace
class BoardAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_date', 'workspace']

class BoardMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'board']

class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['id', 'workspace_name']

admin.site.register(Board, BoardAdmin)
admin.site.register(BoardMember, BoardMemberAdmin)
admin.site.register(Workspace, WorkspaceAdmin)

