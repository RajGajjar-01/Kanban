from django.db import models
from django.contrib.auth.models import User

class Workspace(models.Model):
    workspace_name = models.CharField(max_length=255)
    
    @property
    def user_list(self):
        return Board.objects.filter(workspace = self).all()

class Board(models.Model):
    user             = models.ManyToManyField(User, through='BoardMember', related_name='user')
    name             = models.CharField(max_length=255, default='Untitled')
    created_date     = models.DateTimeField(auto_now_add=True)
    description      = models.TextField()
    background_color = models.CharField(
        max_length=255,
        default = "linear-gradient(to right, #ff7e5f, #feb47b)"
    )
    workspace        = models.ForeignKey(Workspace, on_delete=models.CASCADE)

    @property
    def user_count(self):
        return BoardMember.objects.filter(board=self).count()

    def __str__(self):
        return self.name

class BoardMember(models.Model):
    user  = models.ForeignKey(User, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)

class List(models.Model):
    pass

class Card(models.Model):
    pass

class Comment(models.Model):
    pass


