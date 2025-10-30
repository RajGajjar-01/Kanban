# Landing Page Context Architecture

## Overview
The landing page now uses a centralized context-based approach for managing content, making it easier to maintain and extend.

## Changes Made

### 1. Feature Cards - Hover Effect ✓
**File:** `templates/cotton/app_feature.html`
- Added `transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer` to cards
- Cards now smoothly scale up to 105% on hover with enhanced shadow
- Removed redundant HTML by using a loop

### 2. Context Structure ✓
**File:** `board/views.py` - `landing_view()`

Created a centralized context dictionary containing:
```python
context = {
    "features": [
        {
            "title": "Feature Name",
            "description": "Feature description",
            "icon": "SVG path data"
        },
        # ... more features
    ]
}
```

### 3. Component Integration ✓
**File:** `templates/boards/landing.html`
- Pass context to components using `:features="features"`
- Cotton framework automatically makes context available to child components

## Benefits

1. **Single Source of Truth**: All landing page content in one place
2. **Easy Updates**: Modify features in `views.py` without touching templates
3. **Reduced Redundancy**: Eliminated 90+ lines of repetitive HTML
4. **Scalability**: Easy to add/remove features
5. **Maintainability**: Clear separation of data and presentation

## How to Extend

### Adding New Features
```python
# In board/views.py - landing_view()
context["features"].append({
    "title": "New Feature",
    "description": "Description here",
    "icon": '<path d="..." />'  # SVG path
})
```

### Adding More Context (e.g., for Hero, Pricing, FAQ)
```python
def landing_view(request):
    context = {
        "features": [...],
        "hero": {
            "title": "Organize work, achieve more",
            "subtitle": "Taskify brings your tasks...",
            "cta_primary": "Get Started Free",
            "cta_secondary": "Learn More"
        },
        "pricing": [...],
        "faqs": [...],
    }
    return render(request, "boards/landing.html", context)
```

### Using Context in Other Components
```django
{# In landing.html #}
<c-app_hero :hero="hero" />
<c-app_pricing :plans="pricing" />
<c-app_faq :questions="faqs" />
```

## Next Steps (Optional)

Consider extending this pattern to:
- [ ] Hero section content
- [ ] Pricing plans
- [ ] FAQ items
- [ ] CTA section
- [ ] Testimonials (if added)

This will create a fully data-driven landing page that's easy to manage and update.
