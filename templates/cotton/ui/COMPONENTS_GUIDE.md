# Cotton Components Guide

## Interactive Components with Alpine.js

All components are now powered by Alpine.js for interactivity. Alpine.js is included in `base.html`.

---

## Accordion Component

### Usage
```django
<c-accordion type="single" collapsible="true">
  <c-accordion.item value="item-1">
    <c-accordion.trigger value="item-1">Question 1?</c-accordion.trigger>
    <c-accordion.content value="item-1">
      Answer 1
    </c-accordion.content>
  </c-accordion.item>
  
  <c-accordion.item value="item-2">
    <c-accordion.trigger value="item-2">Question 2?</c-accordion.trigger>
    <c-accordion.content value="item-2">
      Answer 2
    </c-accordion.content>
  </c-accordion.item>
</c-accordion>
```

### Props
- **type**: `"single"` (only one item open at a time)
- **collapsible**: `"true"` or `"false"` (allow closing the active item)
- **value**: Unique identifier for each accordion item (must match on trigger and content)

### Features
- ✅ Smooth collapse/expand animation
- ✅ Only one item open at a time
- ✅ Chevron icon rotates on open/close
- ✅ Fully accessible

---

## Avatar Component

### Usage
```django
<!-- With image -->
<c-avatar>
  <c-avatar.image src="https://example.com/avatar.jpg" alt="User" />
  <c-avatar.fallback>JD</c-avatar.fallback>
</c-avatar>

<!-- Fallback only -->
<c-avatar>
  <c-avatar.fallback>AB</c-avatar.fallback>
</c-avatar>

<!-- Custom size -->
<c-avatar class="h-16 w-16">
  <c-avatar.image src="https://example.com/avatar.jpg" alt="User" />
  <c-avatar.fallback>JD</c-avatar.fallback>
</c-avatar>
```

### Props
- **src**: Image URL (on avatar.image)
- **alt**: Alt text for image (on avatar.image)
- **class**: Custom size classes (on avatar root)

---

## Button Component

### Usage
```django
<!-- Default button -->
<c-button>Click me</c-button>

<!-- Variants -->
<c-button variant="default">Default</c-button>
<c-button variant="destructive">Delete</c-button>
<c-button variant="outline">Outline</c-button>
<c-button variant="secondary">Secondary</c-button>
<c-button variant="ghost">Ghost</c-button>
<c-button variant="link">Link</c-button>

<!-- Sizes -->
<c-button size="sm">Small</c-button>
<c-button size="default">Default</c-button>
<c-button size="lg">Large</c-button>
<c-button size="icon">🔥</c-button>

<!-- With type -->
<c-button type="submit">Submit</c-button>
```

### Props
- **variant**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **size**: `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg`
- **type**: `button`, `submit`, `reset`

---

## Badge Component

### Usage
```django
<c-badge>Default</c-badge>
<c-badge variant="secondary">Secondary</c-badge>
<c-badge variant="destructive">Destructive</c-badge>
<c-badge variant="outline">Outline</c-badge>
```

### Props
- **variant**: `default`, `secondary`, `destructive`, `outline`

---

## Card Component

### Usage
```django
<c-card>
  <c-card.header>
    <c-card.title>Card Title</c-card.title>
    <c-card.description>Card description</c-card.description>
    <c-card.action>
      <c-button variant="ghost">Action</c-button>
    </c-card.action>
  </c-card.header>

  <c-card.content>
    <p>Card content goes here</p>
  </c-card.content>

  <c-card.footer class="border-t">
    <c-button variant="outline">Cancel</c-button>
    <c-button>Submit</c-button>
  </c-card.footer>
</c-card>
```

---

## Checkbox Component

### Usage
```django
<div class="flex items-center space-x-2">
  <c-checkbox id="terms" name="terms" />
  <label for="terms">Accept terms and conditions</label>
</div>

<!-- Checked by default -->
<c-checkbox id="newsletter" checked="checked" />
```

### Props
- **id**: Input ID
- **name**: Input name
- **value**: Input value
- **checked**: `"checked"` to check by default

---

## Field Component

### Usage
```django
<!-- Simple field -->
<c-field>
  <c-field.label for="email">Email</c-field.label>
  <input id="email" type="email" />
  <c-field.description>We'll never share your email.</c-field.description>
</c-field>

<!-- Field with error -->
<c-field>
  <c-field.label for="username">Username</c-field.label>
  <input id="username" type="text" />
  <c-field.error>Username is already taken.</c-field.error>
</c-field>

<!-- Horizontal field (checkbox/switch) -->
<c-field orientation="horizontal">
  <c-checkbox id="newsletter" />
  <c-field.label for="newsletter">Subscribe to newsletter</c-field.label>
</c-field>

<!-- Field group with fieldset -->
<c-field.set>
  <c-field.legend>Profile Information</c-field.legend>
  <c-field.description>Update your profile details.</c-field.description>
  
  <c-field.group>
    <c-field>
      <c-field.label for="name">Name</c-field.label>
      <input id="name" type="text" />
    </c-field>
    
    <c-field>
      <c-field.label for="email">Email</c-field.label>
      <input id="email" type="email" />
    </c-field>
  </c-field.group>
</c-field.set>
```

### Props
- **orientation**: `vertical` (default), `horizontal`, `responsive`
- **for**: Label's for attribute (on field.label)
- **variant**: `legend` or `label` (on field.legend)

---

## Textarea Component

### Usage
```django
<c-textarea id="bio" placeholder="Tell us about yourself..." rows="4" />

<!-- With Field -->
<c-field>
  <c-field.label for="message">Message</c-field.label>
  <c-textarea id="message" placeholder="Type your message here." />
</c-field>
```

### Props
- **id**: Input ID
- **name**: Input name
- **placeholder**: Placeholder text
- **rows**: Number of rows (default: 3)

---

## Switch Component

### Usage
```django
<!-- Basic switch -->
<c-switch id="airplane-mode" />

<!-- With label -->
<c-field orientation="horizontal">
  <c-switch id="notifications" />
  <c-field.label for="notifications">Enable notifications</c-field.label>
</c-field>

<!-- Checked by default -->
<c-switch id="marketing" checked="true" />
```

### Props
- **id**: Input ID
- **name**: Input name
- **checked**: `"true"` or `"false"` (default: false)

### Features
- ✅ Toggle on/off with Alpine.js
- ✅ Smooth sliding animation
- ✅ Accessible with ARIA attributes

---

## Toggle Component

### Usage
```django
<!-- Basic toggle -->
<c-toggle>
  <svg>...</svg>
</c-toggle>

<!-- Variants -->
<c-toggle variant="default">Toggle</c-toggle>
<c-toggle variant="outline">Toggle</c-toggle>

<!-- Sizes -->
<c-toggle size="sm">Small</c-toggle>
<c-toggle size="default">Default</c-toggle>
<c-toggle size="lg">Large</c-toggle>

<!-- Pressed by default -->
<c-toggle pressed="true">Active</c-toggle>
```

### Props
- **variant**: `default`, `outline`
- **size**: `sm`, `default`, `lg`
- **pressed**: `"true"` or `"false"` (default: false)

### Features
- ✅ Two-state button (on/off)
- ✅ Alpine.js powered state management
- ✅ Visual feedback on press

---

## Spinner Component

### Usage
```django
<!-- Basic spinner -->
<c-spinner />

<!-- Different sizes -->
<c-spinner size="4" />
<c-spinner size="6" />
<c-spinner size="8" />

<!-- In button -->
<c-button>
  <c-spinner size="4" />
  Loading...
</c-button>
```

### Props
- **size**: Size in Tailwind units (default: 4)

---

## Toast/Sonner Component

### Usage
```django
<!-- Add to base.html (already included) -->
<c-toast />

<!-- Trigger from any component -->
<c-button @click="$dispatch('toast', { detail: { message: 'Success!', type: 'success' } })">
  Show Toast
</c-button>

<!-- Different types -->
@click="$dispatch('toast', { detail: { message: 'Default message', type: 'default' } })"
@click="$dispatch('toast', { detail: { message: 'Success!', type: 'success' } })"
@click="$dispatch('toast', { detail: { message: 'Error!', type: 'error' } })"
@click="$dispatch('toast', { detail: { message: 'Warning!', type: 'warning' } })"
```

### Features
- ✅ Auto-dismiss after 5 seconds
- ✅ Click to dismiss
- ✅ Multiple toast types with colors
- ✅ Smooth animations
- ✅ Positioned at top-right

---

## Table Component

### Usage
```django
<c-table>
  <c-table.caption>A list of your recent invoices.</c-table.caption>
  
  <c-table.header>
    <c-table.row>
      <c-table.head>Invoice</c-table.head>
      <c-table.head>Status</c-table.head>
      <c-table.head class="text-right">Amount</c-table.head>
    </c-table.row>
  </c-table.header>
  
  <c-table.body>
    <c-table.row>
      <c-table.cell class="font-medium">INV001</c-table.cell>
      <c-table.cell>Paid</c-table.cell>
      <c-table.cell class="text-right">$250.00</c-table.cell>
    </c-table.row>
  </c-table.body>
</c-table>
```

### Components
- **table**: Root table wrapper
- **table.header**: Table header
- **table.body**: Table body
- **table.row**: Table row
- **table.head**: Header cell
- **table.cell**: Body cell
- **table.caption**: Table caption

---

## Datepicker Component

### Usage
```django
<!-- Basic datepicker -->
<c-datepicker id="date" name="date" />

<!-- With custom placeholder -->
<c-datepicker id="birthdate" name="birthdate" placeholder="Select your birthday" />

<!-- With Field -->
<c-field>
  <c-field.label>Select Date</c-field.label>
  <c-datepicker id="date" name="date" placeholder="Pick a date" />
</c-field>
```

### Props
- **id**: Input ID
- **name**: Input name (for form submission)
- **placeholder**: Placeholder text (default: "Pick a date")

### Features
- ✅ Full calendar view with Alpine.js
- ✅ Month/year navigation
- ✅ Click outside to close
- ✅ Hidden input for form submission
- ✅ Date formatting
- ✅ Responsive design

---

## Notes

- All components support `{{ attrs }}` for passing additional HTML attributes
- All components support custom classes via the `class` attribute
- Alpine.js is required for interactive components
- The collapse plugin provides smooth animations
- Toast container is automatically included in base.html
