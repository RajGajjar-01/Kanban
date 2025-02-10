from django.shortcuts import render
from . import forms, models
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

def landing_view(request):
    return render(request, 'board/Landing.html')    

@login_required
def home_view(request):
    workspace_modal_form = forms.WorkspaceModalForm(auto_id=True)
    user_initial = request.user.username[:1].upper()
    context = {
        'user_initial': user_initial,
        'hello': 'I am raj',
        'createworkspace': workspace_modal_form,
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
    if request.method == "DELETE":
        print("DELETE request received")
        try:
            import json
            data = json.loads(request.body) 
            workspace_id = data.get("workspace_id") 

            
            workspace = models.Workspace.objects.filter(id=workspace_id, created_by=request.user).first()

            if workspace:
                workspace.delete()
                return JsonResponse({"success": True, "message": "Workspace deleted successfully."})
            else:
                return JsonResponse({"success": False, "message": "Workspace not found or unauthorized."}, status=404)
        
        except Exception as e:
            return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)
    
    return JsonResponse({"success": False, "message": "Invalid request method. Use DELETE."}, status=400)

   