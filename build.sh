#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Astral uv
curl -sSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# Sync dependencies using uv
uv sync

# Run Django management tasks using uv
uv run python manage.py collectstatic --no-input
uv run python manage.py migrate


