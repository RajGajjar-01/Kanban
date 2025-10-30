from django.shortcuts import render, get_object_or_404, redirect
from . import forms, models
from .landing_context import get_landing_context, get_about_context
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.core.mail import send_mail
from KanbanBoardApp.settings import DEFAULT_FROM_EMAIL
from django.utils import timezone
from django.conf import settings


def landing_view(request):
    landing_data = get_landing_context()
    context = {
        "features": landing_data["features"]["items"],
        **landing_data
    }
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


@login_required
def save_workspace_view(request):
    if request.method == "POST":
        workspace_modal_form = forms.WorkspaceModalForm(request.POST)
        if workspace_modal_form.is_valid():
            workspace = workspace_modal_form.save(commit=False)
            workspace.request = request
            workspace.save()
        return JsonResponse({"success": True, "name": workspace.workspace_name})
    return JsonResponse({"success": False, "message": "Invalid method"})


@login_required
def get_all_workspaces_view(request):
    if request.method == "GET":
        try:
            workspaces = models.Workspace.objects.filter(
                created_by=request.user
            ).values("id", "workspace_name", "created_by", "created_date")
            workspace_list = list(workspaces)

            return JsonResponse({"success": True, "workspaces": workspace_list})

        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid method. Use GET to fetch workspaces."},
        status=400,
    )


@login_required
def delete_workspace_view(request, pk):
    if request.method == "DELETE":
        try:
            workspace = models.Workspace.objects.filter(pk=pk).first()
            if workspace is None:
                return JsonResponse(
                    {"success": False, "message": "Workspace not found"}, status=404
                )

            workspace.delete()
            return JsonResponse({"success": True, "message": "Workspace deleted"})

        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )

    return JsonResponse({"success": False, "message": "Invalid method"}, status=400)


@login_required
def get_all_boards_view(request, pk):
    if request.method == "GET":
        try:
            boards = models.Board.objects.filter(workspace=pk).values(
                "id",
                "name",
                "created_date",
                "description",
                "background_color",
                "workspace",
            )
            board_list = list(boards)

            return JsonResponse({"success": True, "board": board_list})

        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid method. Use GET to fetch workspaces."},
        status=400,
    )


@login_required
def get_particular_boards_view(request, pk):
    if request.method == "GET":
        try:
            boards = models.Board.objects.filter(
                workspace=pk, user=request.user
            ).values(
                "id",
                "name",
                "created_date",
                "description",
                "background_color",
                "workspace",
            )
            board_list = list(boards)

            return JsonResponse({"success": True, "board": board_list})

        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid method. Use GET to fetch workspaces."},
        status=400,
    )


@login_required
def create_board_view(request, pk):
    if request.method == "POST":
        try:
            data = request.POST.copy()
            workspace = models.Workspace.objects.filter(pk=pk).first()
            data["workspace"] = workspace
            form = forms.BoardModalForm(data)
            if form.is_valid():
                form.save()
                return JsonResponse({"success": True, "board": "b"})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


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
    return render(request, "board/boardIn.html", context)


def api_board_name_edit_view(request, pk):
    if request.method == "POST":
        try:
            print(request.POST)
            new_name = request.POST.get("value")
            updated = models.Board.objects.filter(id=pk).update(name=new_name)
            if updated == 0:
                return JsonResponse(
                    {"success": False, "message": "Board not found."}, status=404
                )
            return JsonResponse(
                {"success": True, "message": "Board name updated successfully."}
            )
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occured: {str(e)}"}, status=500
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


@csrf_exempt
def api_get_lists_view(request, pk):
    if request.method == "GET":
        try:
            boardlist = models.List.objects.filter(board=pk).values(
                "id", "list_name", "list_position"
            )

            board_lists = list(boardlist)
            for each_list in board_lists:
                listcards = models.Card.objects.filter(list_id=each_list["id"]).values(
                    "id", "card_name"
                )
                each_list["cards"] = list(listcards)

            return JsonResponse({"success": True, "boardlists": board_lists})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_create_list_view(request):
    if request.method == "POST":
        try:
            print(request.POST)
            form = forms.ListModalForm(request.POST)
            print(form.is_valid())
            if form.is_valid():
                form.save()
                return JsonResponse({"success": True, "message": "List created"})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid request method"}, status=400
    )


def api_delete_list_view(request, pk):
    if request.method == "DELETE":
        try:
            list_to_delete = models.List.objects.filter(pk=pk).first()
            if list_to_delete:
                list_to_delete.delete()
                return JsonResponse({"success": True, "message": "List deleted"})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_create_card_view(request):
    if request.method == "POST":
        try:
            form = forms.CardModalForm(request.POST)
            print(form.is_valid())
            if form.is_valid():
                form.save()
                return JsonResponse({"success": True, "message": "Card created"})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_get_card_view(request, pk):
    if request.method == "GET":
        try:
            listcards = models.Card.objects.filter(list_id=pk).values("id", "card_name")
            cards = list(listcards)
            return JsonResponse({"success": True, "cards": cards})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_card_position_update_view(request, pk, id):
    if request.method == "PUT":
        try:
            updated = models.Card.objects.filter(pk=pk).update(list_id=id)
            if updated:
                return JsonResponse({"success": True, "message": "Position updated"})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_get_members(request, pk):
    if request.method == "GET":
        try:
            boards = models.Workspace.objects.filter(pk=pk).first().board_list
            member_list = []
            for board in list(boards):
                mems = (
                    models.BoardMember.objects.filter(board=board.id)
                    .select_related("user", "user__profile", "board")
                    .values(
                        "user__username",
                        "user__email",
                        "user__profile__image",
                        "board__name",
                    )
                )
                for mem in list(mems):
                    if mem["user__profile__image"]:
                        mem["user__profile__image"] = (
                            settings.MEDIA_URL + mem["user__profile__image"]
                        )
                    else:
                        mem["user__profile__image"] = None
                member_list.append(list(mems))
            return JsonResponse({"success": True, "members": member_list}, status=200)
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)


def api_send_invitation(request, pk):
    # try :
    board = get_object_or_404(models.Board, id=pk)

    if not models.BoardMember.objects.filter(board=board, user=request.user).exists():
        return JsonResponse(
            {"success": False, "message": "You are not a board member"}, status=403
        )

    email = request.POST.get("email")
    invitation = models.BoardInvitaton.objects.create(
        email=email, board=board, inviter=request.user
    )

    invitation_url = request.build_absolute_uri(
        reverse("api_accept_invitation", args=[invitation.token])
    )

    send_mail(
        f"Invitation to join board: {board.name}",
        f"""You've been invited to join the board "{board.name}". 
        Click here to accept: {invitation_url}
        """,
        DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
    return JsonResponse({"success": True, "message": "Invitation send successfully"})

    # except Exception as e:
    #     return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)


def api_accept_invitation(request, token):
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


@csrf_exempt
def get_all_other_workspace_view(request):
    if request.method == "GET":
        try:
            workspaces = (
                models.Workspace.objects.filter(boards__user=request.user)
                .exclude(created_by=request.user)
                .distinct()
                .values("id", "workspace_name", "created_by__username", "created_date")
            )
            other_workspace_list = list(workspaces)

            return JsonResponse({"success": True, "workspaces": other_workspace_list})
        except Exception as e:
            return JsonResponse(
                {"success": False, "message": f"An error occurred: {str(e)}"},
                status=500,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid method. Use GET to fetch workspaces."},
        status=400,
    )
