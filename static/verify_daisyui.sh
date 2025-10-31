#!/bin/bash

echo "🔍 DaisyUI Installation Verification"
echo "===================================="
echo ""

# Check if output.css exists
if [ -f "output.css" ]; then
    SIZE=$(ls -lh output.css | awk '{print $5}')
    echo "✅ output.css exists (Size: $SIZE)"
    
    if [ "$SIZE" != "128K" ] && [ "$SIZE" != "129K" ]; then
        echo "⚠️  Warning: Expected size ~128K, got $SIZE"
    fi
else
    echo "❌ output.css not found!"
    exit 1
fi

echo ""

# Check for DaisyUI classes
echo "Checking for DaisyUI classes..."
BTN_COUNT=$(grep -c "\.btn" output.css)
NAVBAR_COUNT=$(grep -c "\.navbar" output.css)
CARD_COUNT=$(grep -c "\.card" output.css)
BADGE_COUNT=$(grep -c "\.badge" output.css)
COLLAPSE_COUNT=$(grep -c "\.collapse" output.css)

echo "  .btn: $BTN_COUNT occurrences"
echo "  .navbar: $NAVBAR_COUNT occurrences"
echo "  .card: $CARD_COUNT occurrences"
echo "  .badge: $BADGE_COUNT occurrences"
echo "  .collapse: $COLLAPSE_COUNT occurrences"

if [ "$BTN_COUNT" -gt 0 ] && [ "$NAVBAR_COUNT" -gt 0 ]; then
    echo "✅ DaisyUI classes found!"
else
    echo "❌ DaisyUI classes missing!"
    echo "Run: ./tailwindcss -i input.css -o output.css"
    exit 1
fi

echo ""

# Check for theme variables
echo "Checking for theme variables..."
if grep -q "data-theme=light" output.css; then
    echo "✅ Light theme found"
else
    echo "❌ Light theme missing"
fi

if grep -q "data-theme=dark" output.css; then
    echo "✅ Dark theme found"
else
    echo "❌ Dark theme missing"
fi

echo ""

# Check for required files
echo "Checking required files..."
if [ -f "daisyui.mjs" ]; then
    echo "✅ daisyui.mjs exists"
else
    echo "❌ daisyui.mjs missing"
fi

if [ -f "daisyui-theme.mjs" ]; then
    echo "✅ daisyui-theme.mjs exists"
else
    echo "❌ daisyui-theme.mjs missing"
fi

if [ -f "tailwindcss" ]; then
    echo "✅ tailwindcss binary exists"
else
    echo "❌ tailwindcss binary missing"
fi

if [ -f "input.css" ]; then
    echo "✅ input.css exists"
else
    echo "❌ input.css missing"
fi

echo ""
echo "===================================="
echo "✨ Verification Complete!"
echo ""
echo "If all checks passed, your DaisyUI setup is correct."
echo "Start your Django server and visit the landing page."
echo ""
