import platform
import subprocess
import sys

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Build Tailwind CSS"

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true", help="Watch for changes")
        parser.add_argument("--minify", action="store_true", help="Minify output")

    def handle(self, *args, **options):
        if platform.system() not in ("Linux", "Darwin", "Windows"):
            self.stdout.write(self.style.ERROR(f"Unsupported platform: {platform.system()}"))
            sys.exit(1)

        # Build command
        cmd = [
            "./static/vendor/tailwindcss",
            "-i",
            "./static/css/input.css",
            "-o",
            "./static/css/output.css",
        ]

        if options["watch"]:
            cmd.append("--watch")
        if options["minify"]:
            cmd.append("--minify")

        # Run
        self.stdout.write(self.style.SUCCESS("Building Tailwind CSS..."))
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError:
            self.stdout.write(self.style.ERROR("Failed to build Tailwind CSS"))
            sys.exit(1)
