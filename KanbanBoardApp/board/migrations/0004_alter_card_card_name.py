# Generated by Django 5.1.5 on 2025-02-16 16:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0003_alter_list_list_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='card_name',
            field=models.CharField(default='', max_length=255),
        ),
    ]
