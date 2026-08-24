from django.http import Http404
from django.shortcuts import render

from .blog_loader import BlogLoader


def blog_list_view(request):
    """Display all blog posts."""
    loader = BlogLoader()
    posts = loader.get_all_posts()
    tags = loader.get_all_tags()

    context = {"posts": posts, "tags": tags, "title": "Blog"}
    return render(request, "blog/list.html", context)


def blog_detail_view(request, slug):
    """Display a single blog post."""
    loader = BlogLoader()
    post = loader.get_post_by_slug(slug)

    if not post:
        raise Http404("Blog post not found")

    # Get related posts (by tags)
    related_posts = []
    if post.tags:
        for tag in post.tags[:2]:
            related_posts.extend(loader.get_posts_by_tag(tag))
        # Remove duplicates and current post
        seen = set()
        related_posts = [p for p in related_posts if p.slug != post.slug and not (p.slug in seen or seen.add(p.slug))][:3]

    context = {"post": post, "related_posts": related_posts, "title": post.title}
    return render(request, "blog/detail.html", context)


def blog_tag_view(request, tag):
    """Display blog posts filtered by tag."""
    loader = BlogLoader()
    posts = loader.get_posts_by_tag(tag)
    all_tags = loader.get_all_tags()

    context = {"posts": posts, "tags": all_tags, "current_tag": tag, "title": f"Blog - {tag}"}
    return render(request, "blog/list.html", context)
