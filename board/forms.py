from django import forms
from .models import Workspace, Board, List, Card, BoardInvitaton
from django.core.exceptions import ValidationError

class ContactForm(forms.Form):
    REASON_CHOICES = [
        ('', 'Select a reason'),
        ('general', 'General Inquiry'),
        ('support', 'Technical Support'),
        ('feedback', 'Feedback'),
        ('other', 'Other'),
    ]
    name = forms.CharField(label='Your Name', max_length=100, required=True)
    email = forms.EmailField(label='Your Email', required=True)
    reason = forms.ChoiceField(label='Reason for Contact', choices=REASON_CHOICES, required=True)
    subject = forms.CharField(label='Subject', max_length=200, required=False)
    message = forms.CharField(label='Your Message', widget=forms.Textarea(attrs={'rows': 4}), required=True)

class WorkspaceModalForm(forms.ModelForm):

    class Meta:
        model = Workspace
        fields = ['workspace_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
        self.fields['workspace_name'].widget.attrs.update({
            'placeholder' : "Workspace Name",
            'class' : 'w-full p-2 border rounded-lg mb-4',
        })

class BoardModalForm(forms.ModelForm):   
    class Meta:
        model = Board
        fields = ['name', 'description', 'workspace']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        placeholders = {
            'name': 'Board Title',
            'description': 'Description',
        }
    
        for field in self.fields:
            
            self.fields[field].widget.attrs.update({
                'placeholder': placeholders.get(field, ''), 
                'class': 'w-full p-2 border rounded-lg mb-4'
            })

class ListModalForm(forms.ModelForm):
    class Meta:
        model = List
        fields = ['list_name','board','list_position']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['list_name'].widget.attrs.update({
            'placeholder' : "List Name",
            'class' : 'w-full p-2 border rounded-lg mb-4',
        })

class CardModalForm(forms.ModelForm):
    class Meta:
        model = Card
        fields = ['list_id', 'card_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['card_name'].widget.attrs.update({
            'placeholder' : "Task Name",
            'class' : 'w-full p-2 border rounded-lg mb-4',
        })

class InviteModalForm(forms.ModelForm):
    class Meta:
        model = BoardInvitaton
        fields = ['email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['email'].widget.attrs.update({
            'placeholder' : "Enter email",
            'class' : 'w-full p-2 border rounded-lg mb-4',
        })
    

       

        
        