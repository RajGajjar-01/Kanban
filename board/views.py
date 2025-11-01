from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import forms, models, serializers
from . import permissions as custom_permissions
from .landing_context import get_about_context, get_landing_context


def landing_view(request):
    landing_data = get_landing_context()
    context = landing_data
    return render(request, "boards/landing.html", context)


@login_required
def home_view(request):
    board_modal_form = forms.BoardModalForm(auto_id=True)
    workspace_modal_form = forms.WorkspaceModalForm(auto_id=True)
    context = {
        "createworkspace": workspace_modal_form,
        "createboard": board_modal_form,
    }
    return render(request, "board/home.html", context)


def contact_view(request):
    context = {"form": forms.ContactForm}
    return render(request, "board/contact.html", context)


def about_view(request):
    context = get_about_context()
    return render(request, "board/AboutUs.html", context)


def contact_success_view(request):
    return render(request, "board/success.html")


def board_data_view(request, pk, id):
    list_modal_form = forms.ListModalForm(auto_id=True)
    card_modal_form = forms.CardModalForm(auto_id=True)
    invite_modal_form = forms.InviteModalForm(auto_id=True)
    board = models.Board.objects.filter(id=id).first()
    context = {
        "board": board,
        "createList": list_modal_form,
        "createCard": card_modal_form,
        "inviteMember": invite_modal_form,
    }
    return render(request, "board/board.html", context)


def api_accept_invitation(request, token):
    """Accept board invitation - kept for backward compatibility"""
    invitation = get_object_or_404(models.BoardInvitaton, token=token)

    if invitation.status != "pending" or timezone.now() > invitation.expires_at:
        return render(request, "board/Landing.html")

    if request.user.is_authenticated:
        if request.user.email.lower() != invitation.email.lower():
            return render(request, "board/Success.html")

        models.BoardMember.objects.get_or_create(
            user=request.user,
            board=invitation.board,
        )
        invitation.status = "accepted"
        invitation.save()
        return redirect("board-home")
    else:
        request.session["board_invitation_token"] = token
        return redirect("user-login")


# ============================================================================
# BLOG VIEWS
# ============================================================================


def blog_list_view(request):
    """Display all blog posts."""
    from .blog_loader import BlogLoader

    loader = BlogLoader()
    posts = loader.get_all_posts()
    tags = loader.get_all_tags()

    context = {"posts": posts, "tags": tags, "title": "Blog"}
    return render(request, "blog/list.html", context)


def blog_detail_view(request, slug):
    """Display a single blog post."""
    from django.http import Http404

    from .blog_loader import BlogLoader

    loader = BlogLoader()
    post = loader.get_post_by_slug(slug)

    if not post:
        raise Http404("Blog post not found")

    # Get related posts (by tags)
    related_posts = []
    if post.tags:
        for tag in post.tags[:2]:
            related_posts.extend(loader.get_posts_by_tag(tag))
        # Remove duplicates and current post
        seen = set()
        related_posts = [p for p in related_posts if p.slug != post.slug and not (p.slug in seen or seen.add(p.slug))][:3]

    context = {"post": post, "related_posts": related_posts, "title": post.title}
    return render(request, "blog/detail.html", context)


def blog_tag_view(request, tag):
    """Display blog posts filtered by tag."""
    from .blog_loader import BlogLoader

    loader = BlogLoader()
    posts = loader.get_posts_by_tag(tag)
    all_tags = loader.get_all_tags()

    context = {"posts": posts, "tags": all_tags, "current_tag": tag, "title": f"Blog - {tag}"}
    return render(request, "blog/list.html", context)


# ============================================================================
# DJANGO REST FRAMEWORK API VIEWS
# ============================================================================


class WorkspaceViewSet(viewsets.ModelViewSet):
    """DRF ViewSet for Workspace CRUD operations"""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["workspace_name"]
    ordering_fields = ["created_date", "workspace_name"]
    ordering = ["-created_date"]

    def get_queryset(self):
        return models.Workspace.objects.filter(created_by=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.WorkspaceListSerializer
        return serializers.WorkspaceSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), custom_permissions.IsWorkspaceOwner()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = serializer.save()
        return Response(
            {
                "success": True,
                "name": workspace.workspace_name,
                "data": serializers.WorkspaceSerializer(workspace).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Workspace deleted"},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="other-workspaces")
    def other_workspaces(self, request):
        workspaces = models.Workspace.objects.filter(boards__user=request.user).exclude(created_by=request.user).distinct()
        serializer = serializers.WorkspaceListSerializer(workspaces, many=True)
        return Response({"success": True, "workspaces": serializer.data})


class BoardViewSet(viewsets.ModelViewSet):
    """DRF ViewSet for Board CRUD operations"""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["workspace"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_date", "name"]
    ordering = ["-created_date"]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace") or self.kwargs.get("workspace_pk")
        if workspace_id:
            return models.Board.objects.filter(workspace_id=workspace_id)
        return models.Board.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.BoardListSerializer
        elif self.action == "update_name":
            return serializers.BoardNameUpdateSerializer
        return serializers.BoardSerializer

    def create(self, request, *args, **kwargs):
        workspace_id = kwargs.get("workspace_pk") or request.data.get("workspace")
        if not workspace_id:
            return Response(
                {"success": False, "message": "Workspace ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        workspace = get_object_or_404(models.Workspace, pk=workspace_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        board = serializer.save(workspace=workspace)

        return Response(
            {
                "success": True,
                "board": serializers.BoardSerializer(board).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="update-name")
    def update_name(self, request, pk=None):
        board = self.get_object()
        serializer = serializers.BoardNameUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        board.name = serializer.validated_data["value"]
        board.save()
        return Response({"success": True, "message": "Board name updated successfully."})


class ListViewSet(viewsets.ModelViewSet):
    """DRF ViewSet for List CRUD operations"""

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["board"]
    ordering_fields = ["list_position", "list_name"]
    ordering = ["list_position"]

    def get_queryset(self):
        board_id = self.request.query_params.get("board") or self.kwargs.get("board_pk")
        if board_id:
            return models.List.objects.filter(board_id=board_id)
        return models.List.objects.filter(board__user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return serializers.ListCreateSerializer
        return serializers.ListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = serializers.ListSerializer(queryset, many=True)
        return Response({"success": True, "boardlists": serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "List created",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "List deleted"},
            status=status.HTTP_200_OK,
        )


class CardViewSet(viewsets.ModelViewSet):
    """DRF ViewSet for Card CRUD operations"""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["list_id", "label"]
    search_fields = ["card_name", "card_description"]
    ordering_fields = ["created_date", "due_date"]
    ordering = ["-created_date"]

    def get_queryset(self):
        list_id = self.request.query_params.get("list_id") or self.kwargs.get("list_pk")
        if list_id:
            return models.Card.objects.filter(list_id=list_id)
        return models.Card.objects.filter(list_id__board__user=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.CardListSerializer
        return serializers.CardSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = serializers.CardListSerializer(queryset, many=True)
        return Response({"success": True, "cards": serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "Card created",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["put"],
        url_path="move-to-list/(?P<list_id>[^/.]+)",
    )
    def update_position(self, request, pk=None, list_id=None):
        card = self.get_object()
        destination_list = get_object_or_404(models.List, pk=list_id)
        card.list_id = destination_list
        card.save()
        return Response({"success": True, "message": "Position updated"})


class BoardMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """DRF ViewSet for viewing board members"""

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.BoardMemberSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["board"]

    def get_queryset(self):
        workspace_id = self.request.query_params.get("workspace") or self.kwargs.get("workspace_pk")
        if workspace_id:
            workspace = get_object_or_404(models.Workspace, pk=workspace_id)
            boards = workspace.board_list.all()
            return models.BoardMember.objects.filter(board__in=boards)
        return models.BoardMember.objects.filter(board__user=self.request.user)

    def list(self, request, *args, **kwargs):
        workspace_id = kwargs.get("workspace_pk") or request.query_params.get("workspace")
        if not workspace_id:
            return Response(
                {"success": False, "message": "Workspace ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        workspace = get_object_or_404(models.Workspace, pk=workspace_id)
        boards = workspace.board_list.all()
        member_list = []
        for board in boards:
            members = models.BoardMember.objects.filter(board=board).select_related("user", "user__profile", "board")
            serializer = self.get_serializer(members, many=True, context={"request": request})
            member_list.append(serializer.data)

        return Response({"success": True, "members": member_list})
