"""
Blog post loader utility for markdown-based blog system.
Loads .md files from blog_posts directory and converts them to HTML.
"""

import os
import re
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import frontmatter
import markdown
from django.conf import settings


class BlogPost:
    """Represents a single blog post."""

    def __init__(self, slug: str, title: str, content: str, date: datetime, author: str, tags: List[str] = None, excerpt: str = None, image: str = None):
        self.slug = slug
        self.title = title
        self.content = content
        self.date = date
        self.author = author
        self.tags = tags or []
        self.excerpt = excerpt or self._generate_excerpt(content)
        self.image = image

    def _generate_excerpt(self, content: str, length: int = 200) -> str:
        """Generate excerpt from HTML content."""
        # Strip HTML tags for excerpt
        text = re.sub("<[^<]+?>", "", content)
        text = text.replace("#", "").replace("*", "").replace("_", "").strip()

        if len(text) > length:
            return text[:length].rsplit(" ", 1)[0] + "..."
        return text


class BlogLoader:
    """Loads and manages blog posts from markdown files."""

    def __init__(self, posts_dir: str = None):
        """Initialize blog loader with posts directory."""
        if posts_dir is None:
            posts_dir = os.path.join(settings.BASE_DIR, "blog_posts")
        self.posts_dir = Path(posts_dir)

        # Initialize markdown with extensions
        self.md = markdown.Markdown(
            extensions=[
                "extra",  # Tables, fenced code, etc.
                "codehilite",  # Syntax highlighting
                "toc",  # Table of contents
                "nl2br",  # Newline to <br>
            ]
        )

    def get_all_posts(self, sort_by_date: bool = True) -> List[BlogPost]:
        """Get all blog posts."""
        posts = []

        if not self.posts_dir.exists():
            return posts

        # Load all .md files
        for md_file in self.posts_dir.glob("*.md"):
            # Skip README
            if md_file.stem.upper() == "README":
                continue

            post = self._load_post(md_file)
            if post:
                posts.append(post)

        # Sort by date (newest first)
        if sort_by_date:
            posts.sort(key=lambda x: x.date, reverse=True)

        return posts

    def get_post_by_slug(self, slug: str) -> Optional[BlogPost]:
        """Get a single post by its slug."""
        md_file = self.posts_dir / f"{slug}.md"

        if not md_file.exists():
            return None

        return self._load_post(md_file)

    def get_posts_by_tag(self, tag: str) -> List[BlogPost]:
        """Get all posts with a specific tag."""
        all_posts = self.get_all_posts()
        return [post for post in all_posts if tag.lower() in [t.lower() for t in post.tags]]

    def get_all_tags(self) -> List[str]:
        """Get all unique tags from all posts."""
        all_posts = self.get_all_posts()
        tags = set()

        for post in all_posts:
            tags.update(post.tags)

        return sorted(tags)

    def _load_post(self, md_file: Path) -> Optional[BlogPost]:
        """Load and parse a single markdown file."""
        try:
            # Read file with frontmatter
            with open(md_file, "r", encoding="utf-8") as f:
                post_data = frontmatter.load(f)

            # Extract metadata
            slug = md_file.stem
            title = post_data.get("title", slug.replace("-", " ").title())
            author = post_data.get("author", "Anonymous")
            tags = post_data.get("tags", [])
            excerpt = post_data.get("excerpt")
            image = post_data.get("image")

            # Parse date
            date_value = post_data.get("date")
            if isinstance(date_value, datetime):
                date = date_value
            elif isinstance(date_value, str):
                try:
                    date = datetime.strptime(date_value, "%Y-%m-%d")
                except ValueError:
                    try:
                        date = datetime.fromisoformat(date_value)
                    except ValueError:
                        date = datetime.now()
            else:
                # Use file modification time as fallback
                date = datetime.fromtimestamp(md_file.stat().st_mtime)

            # Convert markdown to HTML
            self.md.reset()
            content_html = self.md.convert(post_data.content)

            return BlogPost(slug=slug, title=title, content=content_html, date=date, author=author, tags=tags, excerpt=excerpt, image=image)

        except Exception as e:
            print(f"Error loading blog post {md_file}: {e}")
            return None
