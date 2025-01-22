from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# class CustomUserManager(BaseUserManager):
#     def create_user(self, email, password = None, **extra_fields):
#         if not email: 
#             raise ValueError('The email field is required')

#         email = self.normalize_email(email)

#         user = self.model(email = email, **extra_fields)

#         if password:
#             user.set_password(password)

#         user.save(self._db)
#         return user
    
#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
        
#         if not extra_fields.get('is_staff'):
#             raise ValueError('Superuser must have is_staff=True.')
#         if not extra_fields.get('is_superuser'):
#             raise ValueError('Superuser must have is_superuser=True.')
        
#         return self.create_user(email, password, **extra_fields)

# class CustomUser(AbstractBaseUser, PermissionsMixin):
#     email           = models.EmailField(unique=True, primary_key=True)
#     password        = models.CharField(max_length=128, blank=True, null=True)  # Optional for Google users
#     signup_date     = models.DateTimeField(default=now)
#     google_id       = models.CharField(max_length=255, blank=True, null=True)  # Store Google user ID
#     google_avatar   = models.URLField(blank=True, null=True)  # Optional: Google profile picture
#     is_staff        = models.BooleanField(default=False)
#     is_active       = models.BooleanField(default=True)
#     is_admin        = models.BooleanField(default=False)
#     is_superuser    = models.BooleanField(default=False)

#     objects = CustomUserManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = []

