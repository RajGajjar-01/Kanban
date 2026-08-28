from django import forms

from .models import Board, BoardInvitaton, Card, List, Workspace


class ContactForm(forms.Form):
    REASON_CHOICES = [
        ("", "Select a reason"),
        ("general", "General Inquiry"),
        ("support", "Technical Support"),
        ("feedback", "Feedback"),
        ("other", "Other"),
    ]
    name = forms.CharField(label="Your Name", max_length=100, required=True)
    email = forms.EmailField(label="Your Email", required=True)
    reason = forms.ChoiceField(label="Reason for Contact", choices=REASON_CHOICES, required=True)
    subject = forms.CharField(label="Subject", max_length=200, required=False)
    message = forms.CharField(
        label="Your Message",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=True,
    )


class StyledFormMixin:
    """Applies a placeholder + shared CSS class to the fields listed in `placeholders`."""

    placeholders = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field, placeholder in self.placeholders.items():
            self.fields[field].widget.attrs.update(
                {"placeholder": placeholder, "class": "w-full p-2 border rounded-lg mb-4"}
            )


class WorkspaceModalForm(StyledFormMixin, forms.ModelForm):
    placeholders = {"workspace_name": "Workspace Name"}

    class Meta:
        model = Workspace
        fields = ["workspace_name"]


class BoardModalForm(StyledFormMixin, forms.ModelForm):
    placeholders = {"name": "Board Title", "description": "Description", "workspace": ""}

    class Meta:
        model = Board
        fields = ["name", "description", "workspace"]


class ListModalForm(StyledFormMixin, forms.ModelForm):
    placeholders = {"list_name": "List Name"}

    class Meta:
        model = List
        fields = ["list_name", "board", "list_position"]


class CardModalForm(StyledFormMixin, forms.ModelForm):
    placeholders = {"card_name": "Task Name"}

    class Meta:
        model = Card
        fields = [
            "list_id",
            "card_name",
            "card_description",
            "priority",
            "status",
            "story_points",
            "assignee",
            "start_date",
            "due_date",
            "tags",
            "cover_color",
            "is_completed",
            "label",
        ]


class InviteModalForm(StyledFormMixin, forms.ModelForm):
    placeholders = {"email": "Enter email"}

    class Meta:
        model = BoardInvitaton
        fields = ["email"]
