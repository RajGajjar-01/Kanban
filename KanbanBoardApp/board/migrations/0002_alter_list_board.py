# Generated by Django 5.1.5 on 2025-02-14 20:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='list',
            name='board',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='boardlists', to='board.board'),
        ),
    ]
