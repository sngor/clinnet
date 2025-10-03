# UnifiedButton Component

A comprehensive, polymorphic button system with consistent styling and full accessibility support.

## Features

- **Polymorphic rendering**: Can render as different HTML elements (`button`, `a`, `div`, etc.)
- **Multiple variants**: `contained`, `outlined`, `text`, `ghost`
- **Multiple sizes**: `xs`, `sm`, `md`, `lg`, `xl`
- **Multiple colors**: `primary`, `secondary`, `success`, `warning`, `error`
- **Icon composition**: Support for `startIcon` and `endIcon` with consistent spacing
- **Loading states**: Built-in loading spinner with smooth transitions
- **Full accessibility**: ARIA attributes, keyboard navigation, focus management
- **Theme-aware**: Automatic light/dark mode support
- **Design token integration**: Uses design system tokens for consistent styling

## Replaces

This component replaces the following legacy components:

- `EnhancedButton`
- `AppButton`
- `PrimaryButton`
- `SecondaryButton`
- `TextButton`
- `LinkButton`

## Basic Usage

```jsx
import { UnifiedButton } from '../components/ui';

// Basic button
<UnifiedButton>Click me</UnifiedButton>

// Different variants
<UnifiedButton variant="contained">Contained</UnifiedButton>
<UnifiedButton variant="outlined">Outlined</UnifiedButton>
<UnifiedButton variant="text">Text</UnifiedButton>
<UnifiedButton variant="ghost">Ghost</UnifiedButton>

// Different sizes
<UnifiedButton size="xs">Extra Small</UnifiedButton>
<UnifiedButton size="sm">Small</UnifiedButton>
<UnifiedButton size="md">Medium (default)</UnifiedButton>
<UnifiedButton size="lg">Large</UnifiedButton>
<UnifiedButton size="xl">Extra Large</UnifiedButton>

// Different colors
<UnifiedButton color="primary">Primary</UnifiedButton>
<UnifiedButton color="secondary">Secondary</UnifiedButton>
<UnifiedButton color="success">Success</UnifiedButton>
<UnifiedButton color="warning">Warning</UnifiedButton>
<UnifiedButton color="error">Error</UnifiedButton>
```

## With Icons

```jsx
import { Add, Save, Delete } from '@mui/icons-material';

// Start icon
<UnifiedButton startIcon={<Add />}>
  Add Item
</UnifiedButton>

// End icon
<UnifiedButton endIcon={<Save />}>
  Save Changes
</UnifiedButton>

// Icon-only button (requires aria-label)
<UnifiedButton
  startIcon={<Delete />}
  aria-label="Delete item"
/>
```

## States

```jsx
// Loading state
<UnifiedButton loading>
  Loading...
</UnifiedButton>

// Disabled state
<UnifiedButton disabled>
  Disabled
</UnifiedButton>

// Full width
<UnifiedButton fullWidth>
  Full Width Button
</UnifiedButton>
```

## Polymorphic Rendering

```jsx
// Render as link
<UnifiedButton as="a" href="/dashboard">
  Go to Dashboard
</UnifiedButton>

// Render as div (useful for custom routing)
<UnifiedButton as="div" onClick={handleClick}>
  Custom Element
</UnifiedButton>

// With React Router Link
<UnifiedButton as={Link} to="/profile">
  View Profile
</UnifiedButton>
```

## Accessibility Features

- **Keyboard navigation**: Supports Enter and Space key activation
- **Focus management**: Visible focus rings with proper contrast
- **ARIA attributes**: Automatic aria-label, aria-busy, aria-disabled
- **Screen reader support**: Descriptive labels for different states
- **Touch targets**: Minimum 44px touch targets on mobile
- **High contrast mode**: Enhanced visibility in high contrast mode
- **Reduced motion**: Respects user's motion preferences

## Props

| Prop               | Type                                                            | Default       | Description                                          |
| ------------------ | --------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `as`               | `React.ElementType`                                             | `"button"`    | HTML element or React component to render            |
| `variant`          | `"contained" \| "outlined" \| "text" \| "ghost"`                | `"contained"` | Button style variant                                 |
| `size`             | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                          | `"md"`        | Button size                                          |
| `color`            | `"primary" \| "secondary" \| "success" \| "warning" \| "error"` | `"primary"`   | Button color theme                                   |
| `loading`          | `boolean`                                                       | `false`       | Show loading spinner and disable button              |
| `disabled`         | `boolean`                                                       | `false`       | Disable button interactions                          |
| `fullWidth`        | `boolean`                                                       | `false`       | Make button take full width of container             |
| `startIcon`        | `React.ReactNode`                                               | -             | Icon to display at the start of button               |
| `endIcon`          | `React.ReactNode`                                               | -             | Icon to display at the end of button                 |
| `onClick`          | `function`                                                      | -             | Click event handler                                  |
| `onKeyDown`        | `function`                                                      | -             | Key down event handler                               |
| `aria-label`       | `string`                                                        | -             | Accessibility label (required for icon-only buttons) |
| `aria-labelledby`  | `string`                                                        | -             | ID of element that labels this button                |
| `aria-describedby` | `string`                                                        | -             | ID of element that describes this button             |
| `type`             | `string`                                                        | `"button"`    | Button type (when rendered as button element)        |
| `className`        | `string`                                                        | -             | Additional CSS classes                               |
| `style`            | `object`                                                        | -             | Inline styles                                        |

## Design Tokens Used

The component uses the following design system tokens:

- **Colors**: Theme palette colors for variants and states
- **Typography**: Font sizes, weights, and line heights
- **Spacing**: Padding, margins, and gaps
- **Borders**: Border radius and widths
- **Shadows**: Box shadows for elevation
- **Transitions**: Animation durations and easing
- **Accessibility**: Focus ring styles and minimum touch targets

## Migration Guide

### From AppButton

```jsx
// Before
<AppButton variant="contained" size="medium">
  Save
</AppButton>

// After
<UnifiedButton variant="contained" size="md">
  Save
</UnifiedButton>
```

### From PrimaryButton

```jsx
// Before
<PrimaryButton onClick={handleSave}>
  Save Changes
</PrimaryButton>

// After
<UnifiedButton variant="contained" color="primary" onClick={handleSave}>
  Save Changes
</UnifiedButton>
```

### From SecondaryButton

```jsx
// Before
<SecondaryButton onClick={handleCancel}>
  Cancel
</SecondaryButton>

// After
<UnifiedButton variant="outlined" color="secondary" onClick={handleCancel}>
  Cancel
</UnifiedButton>
```

### From TextButton

```jsx
// Before
<TextButton onClick={handleSkip}>
  Skip
</TextButton>

// After
<UnifiedButton variant="text" onClick={handleSkip}>
  Skip
</UnifiedButton>
```

## Examples

See `UnifiedButtonExample.jsx` for comprehensive usage examples demonstrating all features and variants.
