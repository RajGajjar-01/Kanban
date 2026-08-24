from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import BoardInvitaton
from .tests import make_board_world


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class InvitationCreateTests(TestCase):
    def setUp(self):
        (self.owner, self.member, self.outsider, self.ws, self.board, self.lst, self.card) = make_board_world()

    def client_as(self, user):
        c = APIClient()
        c.force_login(user)
        return c

    def test_member_can_create_invitation_for_own_board(self):
        r = self.client_as(self.member).post(
            "/api/v1/invitations/",
            {"email": "newbie@t.io", "board": self.board.id},
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        invitation = BoardInvitaton.objects.get(email="newbie@t.io")
        self.assertEqual(invitation.inviter, self.member)
        self.assertEqual(invitation.board, self.board)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(f"/accept-invitation/{invitation.token}/", mail.outbox[0].body)
        self.assertIn("Taskify", mail.outbox[0].subject)

    def test_outsider_cannot_invite_to_foreign_board(self):
        r = self.client_as(self.outsider).post(
            "/api/v1/invitations/",
            {"email": "newbie@t.io", "board": self.board.id},
            format="json",
        )
        self.assertEqual(r.status_code, 404)
        self.assertFalse(BoardInvitaton.objects.exists())

    def test_anonymous_gets_403(self):
        r = APIClient().post(
            "/api/v1/invitations/",
            {"email": "newbie@t.io", "board": self.board.id},
            format="json",
        )
        self.assertEqual(r.status_code, 403)
        self.assertFalse(BoardInvitaton.objects.exists())
