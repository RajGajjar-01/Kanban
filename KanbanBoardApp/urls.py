from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from allauth.socialaccount.providers.google.views import oauth2_login, oauth2_callback

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("board.urls")),
    path("user/", include("users.urls")),
    path("accounts/google/login/", oauth2_login, name="google_login"),
    path("accounts/google/login/callback/", oauth2_callback, name="google_callback"),
    path("__reload__/", include("django_browser_reload.urls")),
]

# Comment --> Additional push

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
