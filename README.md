# Kanban Board Application

A modern, feature-rich Kanban board application built with Django, designed for efficient task and project management. Perfect for beginners learning Django and web development!

## Features

- **User Authentication**: Secure login and registration with Django Allauth
- **Kanban Boards**: Create and manage multiple boards for different projects
- **Task Management**: Create, update, and organize tasks across different columns
- **Modern UI**: Beautiful interface styled with TailwindCSS v4 and DaisyUI
- **User Profiles**: Customizable user profiles with avatar support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Built-in light and dark theme support
- **Custom Fonts**: Poppins font family for a modern look

## Tech Stack

- **Backend**: Django 5.1.5+
- **Authentication**: Django Allauth 65.3.1+
- **REST API**: Django REST Framework 3.16.1+
- **Template Components**: Django Cotton 2.1.3+
- **Database**: SQLite (development) - easily switchable to PostgreSQL/MySQL
- **Image Processing**: Pillow 11.1.0+
- **Styling**: TailwindCSS v4 (standalone CLI)
- **UI Components**: DaisyUI
- **Package Manager**: uv (Astral)
- **Python Version**: 3.13+

## Prerequisites

Before you begin, make sure you have the following installed:

- **uv** - Fast Python package manager by Astral - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
  - On Linux/Mac: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - On Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
- **Git** - [Download Git](https://git-scm.com/downloads)
- **curl** (for downloading TailwindCSS) - usually pre-installed on Linux/Mac, available on Windows 10+

> **Note**: `uv` will automatically install the correct Python version (3.13+) for you!

## Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Kanban
```

### Step 2: Install Dependencies with uv

`uv` will automatically create a virtual environment and install all dependencies:

```bash
uv sync
```

This command will:
- Create a virtual environment (`.venv`)
- Install Python 3.13+ if not already installed
- Install all project dependencies from `pyproject.toml`
- Create/update `uv.lock` for reproducible builds

> **Tip**: `uv` is significantly faster than `pip` and handles everything automatically!

### Step 3: Download TailwindCSS Standalone CLI

The project uses TailwindCSS v4 standalone CLI. Download it based on your operating system:

**For Linux:**
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
chmod +x tailwindcss-linux-x64
mv tailwindcss-linux-x64 static/vendor/tailwindcss
```

**For Windows (PowerShell or CMD):**
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe
move tailwindcss-windows-x64.exe static\vendor\tailwindcss.exe
```

> **Note**: The TailwindCSS CLI is already configured to work with DaisyUI components. No additional setup needed!

### Step 4: Set Up the Database

Run these commands to create the database and tables:

```bash
uv run python manage.py migrate
```

> **Tip**: Use `uv run` prefix to run commands in the virtual environment without activating it manually!

### Step 5: Create an Admin User

Create a superuser account to access the admin panel:

```bash
uv run python manage.py createsuperuser
```

Follow the prompts to set your username, email, and password.

### Step 6: Run the Development Server

You need to run **TWO terminals** simultaneously:

**Terminal 1 - Django Development Server:**
```bash
uv run python manage.py runserver
```

**Terminal 2 - TailwindCSS Watch Mode:**

**On Linux/Mac:**
```bash
./static/vendor/tailwindcss -i ./static/css/input.css -o ./static/css/output.css --watch
```

**On Windows:**
```bash
.\static\vendor\tailwindcss.exe -i .\static\css\input.css -o .\static\css\output.css --watch
```

Or use the Django management command (works on all platforms):
```bash
uv run python manage.py tailwind --watch
```

### Step 7: Access the Application

Open your web browser and navigate to:
- **Application**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin

## Project Structure

```
Kanban/
├── KanbanBoardApp/          # Main project settings and configuration
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   └── wsgi.py              # WSGI configuration
├── board/                   # Kanban board application
│   ├── models.py            # Board and task models
│   ├── views.py             # Board views
│   ├── urls.py              # Board URL patterns
│   └── admin.py             # Admin configuration
├── users/                   # User management application
│   ├── models.py            # User profile models
│   ├── views.py             # User views
│   └── forms.py             # User forms
├── templates/               # HTML templates
│   ├── base.html            # Base template
│   ├── board/               # Board templates
│   └── users/               # User templates
├── static/                  # Static files
│   ├── css/                 # CSS files
│   │   ├── input.css        # TailwindCSS input (with DaisyUI config)
│   │   └── output.css       # Compiled CSS (generated)
│   ├── js/                  # JavaScript files
│   ├── fonts/               # Custom fonts (Poppins)
│   └── vendor/              # Third-party libraries
│       ├── tailwindcss      # TailwindCSS CLI executable
│       ├── daisyui.mjs      # DaisyUI plugin
│       └── daisyui-theme.mjs # DaisyUI theme configuration
├── media/                   # User-uploaded files (avatars, etc.)
├── manage.py                # Django management script
├── pyproject.toml           # Project configuration and dependencies
├── uv.lock                  # Locked dependencies (like package-lock.json)
├── .python-version          # Python version specification
└── README.md                # This file
```

## Styling and Theming

This project uses **TailwindCSS v4** with **DaisyUI** for beautiful, pre-built components.

### DaisyUI Documentation

Learn more about DaisyUI components and themes:
- **Official Documentation**: https://daisyui.com/
- **Components**: https://daisyui.com/components/
- **Themes**: https://daisyui.com/docs/themes/

### Custom Theme Configuration

The project includes custom light and dark themes configured in `static/css/input.css`:

- **Light Theme**: Red primary color (#ef4444)
- **Dark Theme**: Yellow primary color (#fcd34d)
- **Custom Variable**: `--custom-primary-dark` (#fa6363) used in hero sections

To modify themes, edit the CSS variables in `static/css/input.css` under the `:root` and `.dark` selectors.

### Available DaisyUI Components

The project is configured to use DaisyUI components like:
- Buttons, Cards, Modals
- Forms, Inputs, Textareas
- Navbars, Dropdowns, Menus
- Alerts, Badges, Progress bars
- And many more!

Check the [DaisyUI Components Gallery](https://daisyui.com/components/) for examples.

## Development

### Code Quality Tools

This project uses modern Python development tools:

- **Ruff**: Fast Python linter and formatter
- **djlint**: Django template linter and formatter
- **Pre-commit hooks**: Automated code quality checks before commits

### Running Linters

```bash
# Run Ruff linter
uv run ruff check .

# Run Ruff formatter
uv run ruff format .

# Run djlint on templates
uv run djlint templates/ --reformat
```

### Database Management

```bash
# Create new migrations after model changes
uv run python manage.py makemigrations

# Apply migrations
uv run python manage.py migrate

# Create a database backup (SQLite)
uv run python manage.py dumpdata > backup.json

# Load data from backup
uv run python manage.py loaddata backup.json
```

### Useful Django Commands

```bash
# Open Django shell
uv run python manage.py shell

# Create a new app
uv run python manage.py startapp app_name

# Collect static files (for production)
uv run python manage.py collectstatic

# Check for common issues
uv run python manage.py check
```

### Managing Dependencies with uv

```bash
# Add a new package
uv add package-name

# Add a development dependency
uv add --dev package-name

# Remove a package
uv remove package-name

# Update all dependencies
uv lock --upgrade

# Sync dependencies (install/update)
uv sync
```

## Configuration

### Key Settings

Important settings can be modified in `KanbanBoardApp/settings.py`:

- **Database**: Configure PostgreSQL, MySQL, or other databases
- **Static Files**: Adjust static file paths and storage
- **Authentication**: Customize Django Allauth settings
- **Security**: Update SECRET_KEY, ALLOWED_HOSTS for production
- **Email**: Configure email backend for password reset

### Environment Variables

For production, use environment variables for sensitive data:

```python
# Example: Using environment variables
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

## Troubleshooting

### Common Issues

**Issue**: TailwindCSS not compiling
- **Solution**: Make sure the TailwindCSS CLI is executable and in the correct path
- **Linux/Mac**: Run `chmod +x static/vendor/tailwindcss`
- **Windows**: Ensure the file has `.exe` extension

**Issue**: Static files not loading
- **Solution**: Run `python manage.py collectstatic` and check `STATIC_URL` in settings

**Issue**: Database errors
- **Solution**: Delete `db.sqlite3` and run `python manage.py migrate` again

**Issue**: Module not found errors
- **Solution**: Run `uv sync` to ensure all dependencies are installed

**Issue**: Command not found when running Django commands
- **Solution**: Use `uv run` prefix before Python commands (e.g., `uv run python manage.py runserver`)

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with a clear description

### Contribution Guidelines

- Follow PEP 8 style guide for Python code
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Run linters before committing

## License

This project is open source and available under the **MIT License**.

## Support

Need help? Here's how to get support:

- **Issues**: Open an issue on the GitHub repository
- **Questions**: Use the Discussions tab on GitHub
- **Documentation**: Check Django docs at https://docs.djangoproject.com/

## Learning Resources

New to Django or web development? Check out these resources:

- **Django Official Tutorial**: https://docs.djangoproject.com/en/stable/intro/tutorial01/
- **uv Documentation**: https://docs.astral.sh/uv/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **DaisyUI Documentation**: https://daisyui.com/
- **Python Official Tutorial**: https://docs.python.org/3/tutorial/

## Deployment

Ready to deploy? Consider these platforms:

- **Heroku**: Easy deployment with Git
- **Railway**: Modern platform with great DX
- **DigitalOcean**: VPS with full control
- **PythonAnywhere**: Beginner-friendly Django hosting

Remember to:
- Set `DEBUG = False` in production
- Use a production database (PostgreSQL recommended)
- Configure proper static file serving
- Set up environment variables for secrets
- Use HTTPS for security

---

**Happy Coding! **

If you found this project helpful, please consider giving it a ⭐ on GitHub!