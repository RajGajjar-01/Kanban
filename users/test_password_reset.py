from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


class PasswordResetFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="old-pw-123!", email="a@t.io")

    def test_request_reset_returns_200_and_sends_email(self):
        r = self.client.post(reverse("password_reset"), {"email": self.user.email}, follow=True)
        self.assertEqual(r.status_code, 200)
        self.assertTemplateUsed(r, "registration/password_reset_done.html")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.user.email, mail.outbox[0].to)

    def test_unknown_email_still_returns_200_without_enumeration(self):
        r = self.client.post(reverse("password_reset"), {"email": "nobody@nowhere.io"}, follow=True)
        self.assertEqual(r.status_code, 200)
        self.assertTemplateUsed(r, "registration/password_reset_done.html")
        self.assertEqual(len(mail.outbox), 0)

    def test_confirm_with_valid_uid_token_sets_new_password(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        confirm_url = reverse("password_reset_confirm", kwargs={"uidb64": uidb64, "token": token})
        response = self.client.get(confirm_url)
        self.assertEqual(response.status_code, 302)
        set_password_url = response["Location"]
        r = self.client.post(
            set_password_url,
            {"new_password1": "brand-new-pw!42", "new_password2": "brand-new-pw!42"},
        )
        self.assertEqual(r.status_code, 302)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("brand-new-pw!42"))
