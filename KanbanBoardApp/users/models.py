from django.contrib.auth.models import User
from django.db import models
from PIL import Image

class Profile(models.Model):
    user    = models.OneToOneField(User, on_delete=models.CASCADE)
    image   = models.ImageField(default='default.png', upload_to='profile_pics')
    bio     = models.TextField(default='About myself')



