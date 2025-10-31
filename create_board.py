#!/usr/bin/env python3
"""
Script to create a board for a user via Django shell
Usage: python3 manage.py shell < create_board.py
"""

from django.contrib.auth.models import User
from board.models import Workspace, Board

# Get or create user
user_email = 'prita@gmail.com'
user = User.objects.filter(email=user_email).first()

if not user:
    print(f'❌ User {user_email} not found.')
    print('\n📋 Available users:')
    for u in User.objects.all():
        print(f'  - {u.username} ({u.email})')
    print('\n💡 Please update the user_email variable in this script.')
else:
    print(f'✅ Found user: {user.username} ({user.email})')
    
    # Create workspace
    workspace, created = Workspace.objects.get_or_create(
        workspace_name='Prita Workspace',
        defaults={'created_by': user}
    )
    
    if created:
        print(f'✅ Created workspace: {workspace.workspace_name} (ID: {workspace.id})')
    else:
        print(f'ℹ️  Using existing workspace: {workspace.workspace_name} (ID: {workspace.id})')
    
    # Create board
    board = Board.objects.create(
        name='My First Board',
        description='This is a test board created via Django shell',
        workspace=workspace,
        background_color='linear-gradient(to right, #667eea, #764ba2)'
    )
    
    print(f'✅ Created board: {board.name} (ID: {board.id})')
    print(f'\n🔗 Access URL: http://localhost:8000/workspace/{workspace.id}/get-board/{board.id}/')
    print(f'🔗 Or go to home: http://localhost:8000/home/')
