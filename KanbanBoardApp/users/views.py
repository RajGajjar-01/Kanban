from django.shortcuts import render, redirect
from django.contrib.auth import logout

def home(request):
    return render(request, "users/Home.html")

def logout_view(request):
    logout(request) 
    return redirect("/")