# Clinnet EMR UI Style Guide

## Overview

This style guide defines the consistent design patterns and components for the Clinnet EMR application. All new components should follow these guidelines to ensure a cohesive user experience.

## Design System

### Spacing System (8px base unit)

- `xs`: 4px - Minimal spacing
- `sm`: 8px - Small spacing
- `md`: 16px - Default spacing
- `lg`: 24px - Large spacing
- `xl`: 32px - Extra large spacing
- `xxl`: 48px - Section spacing
- `xxxl`: 64px - Page spacing

### Border Radius System

- `xs`: 4px - Small elements (chips, small buttons)
- `sm`: 6px - Form fields, small cards
- `md`: 8px - Default for most components
- `lg`: 12px - Cards, modals
- `xl`: 16px - Large cards, containers
- `xxl`: 20px - Special containers
- `full`: 9999px - Pills, avatars

### Typography Scale

- `xs`: 12px - Captions, helper text
- `sm`: 14px - Body text, labels
- `base`: 16px - Default body text
- `lg`: 18px - Subheadings
- `xl`: 20px - Small headings
- `2xl`: 24px - Medium headings
- `3xl`: 30px - Large headings
- `4xl`: 36px - Page titles
- `5xl`: 48px - Hero titles

### Transitions

- `fast`: 0.15s - Quick interactions
- `normal`: 0.2s - Default transitions
- `slow`: 0.3s - Complex animations

## Component Guidelines

### Cards

Use `UnifiedCard` for all card components:

```jsx
import { UnifiedCard } from '../components/ui';

// Basic card
<UnifiedCard>Content</UnifiedCard>

// Card with header
<UnifiedCard title="Title" subtitle="Subtitle">
  Content
</UnifiedCard>

// Interactive card
<UnifiedCard interactive onClick={handleClick}>
  Content
</UnifiedCard>

// Card variants
<UnifiedCard variant="elevated">Elevated card</UnifiedCard>
<UnifiedCard variant="flat">Flat card</UnifiedCard>
<UnifiedCard variant="outlined">Outlined card</UnifiedCard>
```

### Buttons

Use `UnifiedButton` for all button components:

```jsx
import { UnifiedButton, UnifiedIconButton } from '../components/ui';

// Primary button
<UnifiedButton variant="contained" color="primary">
  Primary Action
</UnifiedButton>

// Secondary button
<UnifiedButton variant="outlined" color="primary">
  Secondary Action
</UnifiedButton>

// Button with loading state
<UnifiedButton loading={isLoading}>
  Submit
</UnifiedButton>

// Icon button
<UnifiedIconButton>
  <EditIcon />
</UnifiedIconButton>
```

### Form Fields

Use `UnifiedFormField` for all form inputs:

```jsx
import { UnifiedFormField } from '../components/ui';

// Text input
<UnifiedFormField
  type="text"
  name="firstName"
  label="First Name"
  value={value}
  onChange={handleChange}
  required
/>

// Select field
<UnifiedFormField
  type="select"
  name="status"
  label="Status"
  value={value}
  onChange={handleChange}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
/>

// Field with description
<UnifiedFormField
  type="email"
  name="email"
  label="Email Address"
  description="We'll use this to send you notifications"
  value={value}
  onChange={handleChange}
/>
```

### Layout Components

Use unified layout components for consistent spacing:

```jsx
import {
  UnifiedPageContainer,
  UnifiedPageHeader,
  UnifiedSection,
  UnifiedGrid,
  UnifiedFlex
} from '../components/ui';

// Page layout
<UnifiedPageContainer>
  <UnifiedPageHeader
    title="Page Title"
    subtitle="Page description"
    action={<UnifiedButton>Action</UnifiedButton>}
  />

  <UnifiedSection title="Section Title">
    <UnifiedGrid columns={{ xs: 1, sm: 2, md: 3 }}>
      <UnifiedCard>Card 1</UnifiedCard>
      <UnifiedCard>Card 2</UnifiedCard>
      <UnifiedCard>Card 3</UnifiedCard>
    </UnifiedGrid>
  </UnifiedSection>
</UnifiedPageContainer>

// Flex layout
<UnifiedFlex direction="row" align="center" spacing={2}>
  <UnifiedButton>Button 1</UnifiedButton>
  <UnifiedButton>Button 2</UnifiedButton>
</UnifiedFlex>
```

## Color Usage

### Primary Colors

- Use `primary.main` for main actions and headings
- Use `primary.light` for hover states
- Use `primary.dark` for active states

### Status Colors

- `success`: Completed, confirmed actions
- `warning`: Pending, attention needed
- `error`: Failed, cancelled, dangerous actions
- `info`: Informational, in progress

### Text Colors

- `text.primary`: Main content text
- `text.secondary`: Supporting text, descriptions
- `text.disabled`: Disabled state text

## Accessibility Guidelines

### Focus States

- All interactive elements must have visible focus indicators
- Use consistent focus ring: `0 0 0 3px {color}20`

### Color Contrast

- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Provide appropriate ARIA labels and roles

## Migration Guide

### From Old Components to Unified Components

1. **Cards**: Replace `EnhancedCard`, `ContentCard`, `DashboardCard` with `UnifiedCard`
2. **Buttons**: Replace `EnhancedButton`, `AppButton` with `UnifiedButton`
3. **Forms**: Replace `EnhancedTextField`, `FormField` with `UnifiedFormField`
4. **Layout**: Use `UnifiedPageContainer`, `UnifiedPageHeader`, `UnifiedSection`

### Example Migration

Before:

```jsx
<EnhancedCard variant="elevated">
  <EnhancedButton variant="contained" loading={loading}>
    Submit
  </EnhancedButton>
</EnhancedCard>
```

After:

```jsx
<UnifiedCard variant="elevated">
  <UnifiedButton variant="contained" loading={loading}>
    Submit
  </UnifiedButton>
</UnifiedCard>
```

## Best Practices

1. **Consistency**: Always use the unified components instead of creating custom styled components
2. **Spacing**: Use the design system spacing values instead of hardcoded pixels
3. **Colors**: Use theme colors instead of hardcoded hex values
4. **Typography**: Use the typography scale for consistent text sizing
5. **Accessibility**: Always include proper ARIA labels and keyboard navigation
6. **Performance**: Use the provided transitions and avoid custom animations
7. **Responsive**: Design mobile-first and use the responsive grid system

## Component Status

### ✅ Unified (Use These)

- `UnifiedCard` - All card variations
- `UnifiedButton` - All button variations
- `UnifiedFormField` - All form inputs
- `UnifiedPageContainer` - Page layout
- `UnifiedPageHeader` - Page headers
- `UnifiedSection` - Content sections
- `UnifiedGrid` - Grid layouts
- `UnifiedFlex` - Flex layouts

### ⚠️ Legacy (Migrate Away From)

- `EnhancedCard` → `UnifiedCard`
- `ContentCard` → `UnifiedCard`
- `DashboardCard` → `UnifiedCard`
- `EnhancedButton` → `UnifiedButton`
- `AppButton` → `UnifiedButton`
- `EnhancedTextField` → `UnifiedFormField`
- `FormField` → `UnifiedFormField`

### 🔄 In Progress

- Tables (use `EnhancedTable` for now)
- Status components (use existing `StatusChip`)
- Loading states (use existing components)

## Questions?

For questions about the design system or component usage, please refer to this guide or reach out to the development team.
