#!/usr/bin/env bash
# Exit on error
set -o errexit

# uv is preinstalled by Render's Python runtime

# Sync dependencies using uv
uv sync

# Run Django management tasks using uv
uv run python manage.py collectstatic --no-input
uv run python manage.py migrate


