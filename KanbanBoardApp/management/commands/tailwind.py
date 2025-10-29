import os
import sys
import platform
import subprocess
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Build Tailwind CSS'

    def add_arguments(self, parser):
        parser.add_argument('--watch', action='store_true', help='Watch for changes')
        parser.add_argument('--minify', action='store_true', help='Minify output')

    def handle(self, *args, **options):
        # Detect platform
        system = platform.system()
        binaries = {
            "Linux": "./tailwindcss-linux-x64",
            "Darwin": "./tailwindcss-macos-arm64",
            "Windows": "./tailwindcss-windows-x64.exe"
        }
        
        binary = binaries.get(system)
        if not binary:
            self.stdout.write(self.style.ERROR(f'Unsupported platform: {system}'))
            sys.exit(1)

        # Build command
        cmd = [
            binary,
            "-i", "./static/src/input.css",
            "-o", "./static/css/tailwind.css"
        ]
        
        if options['watch']:
            cmd.append('--watch')
        if options['minify']:
            cmd.append('--minify')

        # Run
        self.stdout.write(self.style.SUCCESS('Building Tailwind CSS...'))
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError:
            self.stdout.write(self.style.ERROR('Failed to build Tailwind CSS'))
            sys.exit(1)
