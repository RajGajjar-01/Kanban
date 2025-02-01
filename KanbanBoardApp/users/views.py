from . import forms
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

def register_view(request):
    if request.method == 'POST':
        fm = forms.UserRegistrationForm(request.POST)
        if fm.is_valid():
            print(fm.cleaned_data)
            fm.save()
            return redirect('login')
    else :
        fm = forms.UserRegistrationForm()
    return render(request, 'users/Register.html', {'form': fm})

def login_view(request):
    if request.method == 'POST':
        form = forms.UserLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            print(f'{email} and {password}')
            user = authenticate(request, email=email, password=password)
            print(user)
            if user is not None:
                login(request, user)
                messages.success(request, "You have logged in successfully!")
                return redirect('home')
            else:
                messages.error(request, "Invalid email or password.")
    else:
        form = forms.UserLoginForm()
    
    return render(request, 'users/Login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('/')

@login_required
def profile_view(request):
    if request.method == 'POST':
        u_form = forms.UserUpdateForm(request.POST, instance=request.user)
        p_form = forms.ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)

        if u_form.is_valid() and p_form.is_valid() :
            u_form.save()
            p_form.save()
            redirect('/profile')
    else :
        u_form = forms.UserUpdateForm(instance=request.user)
        p_form = forms.ProfileUpdateForm(instance=request.user.profile)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }

    return render(request, 'users/Profile.html', context)
