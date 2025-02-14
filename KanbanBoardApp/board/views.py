from django.shortcuts import render
from . import forms, models
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

def landing_view(request):
    return render(request, 'board/Landing.html')    

@login_required
def home_view(request):
    board_modal_form = forms.BoardModalForm(auto_id=True)
    workspace_modal_form = forms.WorkspaceModalForm(auto_id=True)
    context = {
        'hello': 'I am raj',
        'createworkspace': workspace_modal_form,
        'createboard': board_modal_form,
    }
    return render(request, 'board/Home.html', context)

def contact_view(request):
    context = {'form': forms.ContactForm }
    return render(request, 'board/Contact.html', context)

def about_view(request):
    pass

def workspace_view(request):
    pass

def contact_success_view(request):
    return render(request, 'board/Success.html')

@login_required
def board_view(request):
    pass

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
            workspaces = models.Workspace.objects.filter(created_by=request.user).values(
                'id', 'workspace_name', 'created_by', 'created_date'
            )
            workspace_list = list(workspaces)

            return JsonResponse({"success": True, "workspaces": workspace_list})
        
        except Exception as e:
            return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)
    return JsonResponse({"success": False, "message": "Invalid method. Use GET to fetch workspaces."}, status=400)

@login_required
def delete_workspace_view(request):
    pass

@login_required
def get_all_boards_view(request, pk):
    if request.method == 'GET':
        try:
            boards = models.Board.objects.filter(workspace=pk).values(
                'id', 'name', 'created_date', 'description', 'background_color', 'workspace'
            )
            board_list = list(boards)

            return JsonResponse({"success": True, "board": board_list})
        
        except Exception as e:
            return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)
    return JsonResponse({"success": False, "message": "Invalid method. Use GET to fetch workspaces."}, status=400)

@login_required
def create_board_view(request, pk):
    if request.method == "POST":
        try:
            data = request.POST.copy()
            workspace = models.Workspace.objects.filter(pk=pk).first()
            data['workspace'] = workspace
            print(data)
            form = forms.BoardModalForm(data)
            if form.is_valid():
                board = form.save()
            return JsonResponse({"success": True, "board": "b"})
        except Exception as e:
            return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)
    return JsonResponse({"success": False, "message": "Invalid."}, status=400)  

def board_data_view(request, pk ,id):
    if request.method == 'GET':
        return render(request, 'board/BoardIn.html')

def api_board_view(request, pk):
    if request.method == 'GET':
        pass