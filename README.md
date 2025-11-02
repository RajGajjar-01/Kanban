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

- **Backend**: Django 5.1.5
- **Authentication**: Django Allauth 65.3.1
- **REST API**: Django REST Framework 3.15.2
- **Database**: SQLite (development) - easily switchable to PostgreSQL/MySQL
- **Image Processing**: Pillow 11.1.0
- **Styling**: TailwindCSS v4 (standalone CLI)
- **UI Components**: DaisyUI
- **Python Version**: 3.13+

## Prerequisites

Before you begin, make sure you have the following installed:

- **Python 3.13 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (comes with Python) or **uv** package manager
- **Git** - [Download Git](https://git-scm.com/downloads)
- **curl** (for downloading TailwindCSS) - usually pre-installed on Linux/Mac, available on Windows 10+

## Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Kanban
```

### Step 2: Set Up Python Virtual Environment

**On Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**On Linux/Mac:**
```bash
python -m venv .venv
source .venv/bin/activate
```

> **Tip**: You should see `(.venv)` at the beginning of your command prompt when the virtual environment is activated.

### Step 3: Install Python Dependencies

**Using pip:**
```bash
pip install -r requirements.txt
```

**Or using uv (faster):**
```bash
uv sync
```

### Step 4: Download TailwindCSS Standalone CLI

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

### Step 5: Set Up the Database

Run these commands to create the database and tables:

```bash
python manage.py migrate
```

### Step 6: Create an Admin User

Create a superuser account to access the admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to set your username, email, and password.

### Step 7: Run the Development Server

You need to run **TWO terminals** simultaneously:

**Terminal 1 - Django Development Server:**
```bash
python manage.py runserver
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
python manage.py tailwind --watch
```

### Step 8: Access the Application

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
├── requirements.txt         # Python dependencies
├── pyproject.toml           # Project configuration (for uv)
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
ruff check .

# Run Ruff formatter
ruff format .

# Run djlint on templates
djlint templates/ --reformat
```

### Database Management

```bash
# Create new migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create a database backup (SQLite)
python manage.py dumpdata > backup.json

# Load data from backup
python manage.py loaddata backup.json
```

### Useful Django Commands

```bash
# Open Django shell
python manage.py shell

# Create a new app
python manage.py startapp app_name

# Collect static files (for production)
python manage.py collectstatic

# Check for common issues
python manage.py check
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
- **Solution**: Make sure virtual environment is activated and dependencies are installed

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