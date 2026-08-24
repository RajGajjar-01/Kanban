from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Board, BoardInvitaton, Card, List, Workspace


def make_board_world():
    """owner's workspace > board > list > card, plus an invited member and an outsider."""
    owner = User.objects.create_user(username="owner", password="pw12345!", email="o@t.io")
    member = User.objects.create_user(username="member", password="pw12345!", email="m@t.io")
    outsider = User.objects.create_user(username="outsider", password="pw12345!", email="x@t.io")
    ws = Workspace.objects.create(workspace_name="WS", created_by=owner)
    board = Board.objects.create(name="B", description="d", workspace=ws)
    lst = List.objects.create(list_name="L", board=board)
    card = Card.objects.create(card_name="C", list_id=lst)
    Board.objects.get(pk=board.pk).memofboard.create(user=member)
    return owner, member, outsider, ws, board, lst, card


class AuthzTestCase(TestCase):
    def setUp(self):
        (self.owner, self.member, self.outsider, self.ws, self.board, self.lst, self.card) = make_board_world()

    def client_as(self, user):
        c = APIClient()
        c.force_login(user)
        return c


class WorkspaceAccess(AuthzTestCase):
    def test_outsider_cannot_see_foreign_workspace(self):
        r = self.client_as(self.outsider).get(f"/api/v1/workspaces/{self.ws.id}/")
        self.assertEqual(r.status_code, 404)

    def test_owner_sees_own_workspace(self):
        r = self.client_as(self.owner).get(f"/api/v1/workspaces/{self.ws.id}/")
        self.assertEqual(r.status_code, 200)

    def test_board_member_can_read_workspace_via_other_workspaces(self):
        r = self.client_as(self.member).get("/api/v1/workspaces/other-workspaces/")
        self.assertIn(self.ws.id, [w["id"] for w in r.data["workspaces"]])


class BoardAccess(AuthzTestCase):
    def test_outsider_cannot_retrieve_foreign_board(self):
        r = self.client_as(self.outsider).get(f"/api/v1/boards/{self.board.id}/")
        self.assertEqual(r.status_code, 404)

    def test_outsider_cannot_update_foreign_board(self):
        r = self.client_as(self.outsider).patch(f"/api/v1/boards/{self.board.id}/", {"name": "hax"}, format="json")
        self.assertEqual(r.status_code, 404)
        self.board.refresh_from_db()
        self.assertEqual(self.board.name, "B")

    def test_outsider_cannot_delete_foreign_board(self):
        r = self.client_as(self.outsider).delete(f"/api/v1/boards/{self.board.id}/")
        self.assertIn(r.status_code, [403, 404])
        self.assertTrue(Board.objects.filter(pk=self.board.pk).exists())

    def test_outsider_cannot_create_board_in_foreign_workspace(self):
        r = self.client_as(self.outsider).post(
            "/api/v1/boards/", {"name": "intruder", "description": "x", "workspace": self.ws.id}, format="json"
        )
        self.assertEqual(r.status_code, 404)
        self.assertFalse(Board.objects.filter(name="intruder").exists())

    def test_member_can_retrieve_board(self):
        r = self.client_as(self.member).get(f"/api/v1/boards/{self.board.id}/")
        self.assertEqual(r.status_code, 200)

    def test_board_page_hidden_from_outsider(self):
        c = self.client_as(self.outsider)
        r = c.get(f"/workspace/{self.ws.id}/get-board/{self.board.id}/")
        self.assertEqual(r.status_code, 404)

    def test_board_page_visible_to_member(self):
        r = self.client_as(self.member).get(f"/workspace/{self.ws.id}/get-board/{self.board.id}/")
        self.assertEqual(r.status_code, 200)


class ListAndCardAccess(AuthzTestCase):
    def test_outsider_cannot_create_list_in_foreign_board(self):
        r = self.client_as(self.outsider).post(
            "/api/v1/lists/", {"list_name": "hax", "board": self.board.id}, format="json"
        )
        self.assertEqual(r.status_code, 404)

    def test_outsider_cannot_create_card_in_foreign_list(self):
        r = self.client_as(self.outsider).post(
            "/api/v1/cards/", {"card_name": "hax", "list_id": self.lst.id}, format="json"
        )
        self.assertEqual(r.status_code, 404)
        self.assertFalse(Card.objects.filter(card_name="hax").exists())

    def test_outsider_cannot_move_card_into_foreign_list(self):
        foreign_lst = List.objects.create(list_name="victim-list", board=self.board)
        own_ws = Workspace.objects.create(workspace_name="own", created_by=self.outsider)
        own_board = Board.objects.create(name="own-b", description="d", workspace=own_ws)
        own_lst = List.objects.create(list_name="own-l", board=own_board)
        own_card = Card.objects.create(card_name="mine", list_id=own_lst)
        r = self.client_as(self.outsider).put(f"/api/v1/cards/{own_card.id}/move-to-list/{foreign_lst.id}/")
        self.assertEqual(r.status_code, 404)
        own_card.refresh_from_db()
        self.assertEqual(own_card.list_id, own_lst)


class InvitationAcceptance(AuthzTestCase):
    def invite(self, **kw):
        from django.utils import timezone

        defaults = {
            "email": self.outsider.email,
            "board": self.board,
            "inviter": self.owner,
            "token": "tok123",
            "expires_at": timezone.now() + timezone.timedelta(days=7),
        }
        defaults.update(kw)
        return BoardInvitaton.objects.create(**defaults)

    def test_expired_invitation_does_not_crash(self):
        from django.utils import timezone

        inv = self.invite(expires_at=timezone.now() - timezone.timedelta(days=1))
        r = self.client_as(self.outsider).get(f"/accept-invitation/{inv.token}/")
        self.assertLess(r.status_code, 500)

    def test_wrong_email_is_not_added_to_board(self):
        other = User.objects.create_user(username="other", password="pw12345!", email="z@t.io")
        inv = self.invite(email="someoneelse@x.io")
        self.client_as(other).get(f"/accept-invitation/{inv.token}/")
        self.assertFalse(self.board.memofboard.filter(user=other).exists())
        inv.refresh_from_db()
        self.assertEqual(inv.status, "pending")
