from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string


class Workspace(models.Model):
    workspace_name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.created_by and hasattr(self, "request") and hasattr(self.request, "user"):
            self.created_by = self.request.user
        super().save(*args, **kwargs)

    @property
    def board_list(self):
        return Board.objects.filter(workspace=self)


class Board(models.Model):
    user = models.ManyToManyField(User, through="BoardMember", related_name="user")
    name = models.CharField(max_length=255, default="Untitled")
    created_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    background_color = models.CharField(max_length=255, default="linear-gradient(to right, #ff7e5f, #feb47b)")
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="boards")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and self.workspace.created_by:
            BoardMember.objects.get_or_create(user=self.workspace.created_by, board=self)

    @property
    def user_count(self):
        return BoardMember.objects.filter(board=self).count()

    def __str__(self):
        return self.name


class BoardMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="boarduser")
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="memofboard")

    class Meta:
        unique_together = ("user", "board")

    def __str__(self):
        return f"{self.user.username} - {self.board.name}"


class List(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, null=True, related_name="boardlists")
    list_name = models.CharField(max_length=255)
    list_position = models.IntegerField(default=0)


class Card(models.Model):
    class LabelChoices(models.TextChoices):
        URGENT_IMP = "urgent & important"
        URGENT_NOT_IMP = "urgent but not important"
        IMP_NOT_URGENT = "important but not urgent"
        NOT_URGENT_NOT_IMPORTANT = "neither important nor urgent"

    list_id = models.ForeignKey(List, on_delete=models.CASCADE)
    card_name = models.CharField(max_length=255)
    card_description = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    card_member = models.ManyToManyField(User, through="CardMember", related_name="cards")
    label = models.CharField(max_length=60, choices=LabelChoices.choices, null=True, blank=True)

    def __str__(self):
        return self.card_name

    @property
    def member_count(self):
        """Returns the number of members assigned to this card."""
        return self.card_member.count()


class CardMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "card")

    def __str__(self):
        return f"{self.user.username} - {self.card.card_name}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="comments", null=True)
    content = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.card.card_name}"


class CardActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="activities", null=True)
    activity = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Card activity"
        verbose_name_plural = "Card activities"

    def __str__(self):
        return f"{self.user.username} - {self.activity}"


class CardAttachment(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="attachments")
    uploaded_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200)
    location = models.URLField(max_length=300)

    def __str__(self):
        return f"{self.card.card_name} - {self.name} - {self.uploaded_date}"


class BoardInvitaton(models.Model):
    STATUS_CHOICES = {
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("expired", "Expired"),
    }

    email = models.EmailField()
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    token = models.CharField(max_length=50, unique=True)
    inviter = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="pending")

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = get_random_string(length=50)
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)
