from django.contrib.auth.models import User
from django.db import models
from PIL import Image

class Profile(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE)
    image       = models.ImageField(default='cat.png', upload_to='profile_pics')
    bio         = models.TextField(default='About myself')
    location    = models.CharField(max_length=255, null=True, blank=True)
    website     = models.URLField(null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)




