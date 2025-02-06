from django.shortcuts import render
from . import forms
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

def landing_view(request):
    return render(request, 'board/Landing.html')

def save_workspace_view(request):
    if request.method == "POST":
        form = forms.WorkspaceModalForm(request.POST)
        if form.is_valid():
            workspace = form.save()
            return JsonResponse({'success' : True, 'name' : workspace.workspace_name})
        else:
            return JsonResponse({'success' : True, 'errors' : form.errors}, status = 400)

    return JsonResponse({'success' : False, 'message' : 'Invalid Request'}, status = 400) 
        

@login_required
def home_view(request):
    user_initial = request.user.username[:1].upper()
    context = {
        'user_initial': user_initial,
        'workspace_modal': forms.WorkspaceModalForm,
        'hello': 'I am raj'
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

