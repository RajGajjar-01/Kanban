from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User


class EmailAuthBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        if email is None:
            email = kwargs.get("username")
        if not email or not password:
            return None
        try:
            user = User.objects.filter(email__iexact=email).first()
            if user and user.check_password(password):
                return user
        except Exception:
            return None
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

