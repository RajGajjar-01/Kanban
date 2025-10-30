# Kanban Board Application

A modern, feature-rich Kanban board application built with Django, designed for efficient task and project management.

## Features

- **User Authentication**: Secure login and registration with Django Allauth
- **Kanban Boards**: Create and manage multiple boards
- **Task Management**: Create, update, and organize tasks across different columns
- **Drag & Drop**: Intuitive drag-and-drop interface for task organization
- **User Profiles**: Customizable user profiles with avatar support
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Tech Stack

- **Backend**: Django 5.1.5
- **Authentication**: Django Allauth
- **Database**: SQLite (development)
- **Image Processing**: Pillow
- **Styling**: TailwindCSS
- **Python Version**: 3.13+

## Installation

### Prerequisites

- Python 3.13 or higher
- pip or uv package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Kanban
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   
   Using pip:
   ```bash
   pip install -r requirements.txt
   ```
   
   Or using uv:
   ```bash
   uv sync
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   
   Open your browser and navigate to `http://127.0.0.1:8000`

## Project Structure

```
Kanban/
├── KanbanBoardApp/     # Main project settings
├── board/              # Kanban board app
├── users/              # User management app
├── templates/          # HTML templates
├── static/             # Static files (CSS, JS, images)
├── media/              # User-uploaded files
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
├── pyproject.toml      # Project configuration
└── README.md           # This file
```

## Development

### Code Quality

This project uses:
- **Ruff**: For linting and code formatting
- **djlint**: For Django template linting
- **Pre-commit hooks**: Automated code quality checks

### TailwindCSS

To compile TailwindCSS:
```bash
npx tailwindcss -i ./static/src/input.css -o ./static/src/output.css --watch
```

## Configuration

Key settings can be modified in `KanbanBoardApp/settings.py`:
- Database configuration
- Static files settings
- Authentication backends
- Installed apps

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.

## For linux 

curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64

chmod +x tailwindcss-linux-x64

## For windows 

curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe


## Open 2 terminal

```bash
python manage.py runserver
```

```bash
tailwindcss-linux-x64 -i ./static/src/input.css -o ./static/src/output.css --watch
```

or another command for tailwind
```bash
python manage.py tailwind --watch
```

custom color used in hero section achieve more text checkout 'custom-primary' in input.css