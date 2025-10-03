# Clinnet EMR UI Component System

## Overview

This directory contains the unified UI component system for Clinnet EMR, designed to provide consistent styling, behavior, and user experience across the entire application.

## 🎯 Goals

- **Consistency**: All components follow the same design principles and spacing system
- **Accessibility**: Built-in focus states, keyboard navigation, and ARIA support
- **Performance**: Optimized transitions and minimal re-renders
- **Developer Experience**: Easy to use, well-documented, and type-safe
- **Maintainability**: Centralized styling and easy to update

## 📁 Structure

```
ui/
├── DesignSystem.jsx          # Core design tokens and theme
├── STYLE_GUIDE.md           # Comprehensive style guide
├── README.md                # This file
├── migration-helper.js      # Migration utilities
├── index.js                 # Main exports
├── Cards/
│   ├── UnifiedCard.jsx      # ✅ New unified card component
│   └── EnhancedCard.jsx     # ⚠️ Legacy (migrate to UnifiedCard)
├── Buttons/
│   ├── UnifiedButton.jsx    # ✅ New unified button component
│   └── EnhancedButton.jsx   # ⚠️ Legacy (migrate to UnifiedButton)
├── Forms/
│   ├── UnifiedFormField.jsx # ✅ New unified form component
│   ├── EnhancedTextField.jsx # ⚠️ Legacy
│   └── FormField.jsx        # ⚠️ Legacy
├── Layout/
│   └── UnifiedLayout.jsx    # ✅ New layout components
├── Tables/
│   └── EnhancedTable.jsx    # ✅ Updated with design system
├── examples/
│   └── UnifiedComponentsDemo.jsx # Demo and documentation
└── [other components...]     # Existing components
```

## 🚀 Quick Start

### Using Unified Components

```jsx
import {
  UnifiedCard,
  UnifiedButton,
  UnifiedFormField,
  UnifiedPageContainer,
  UnifiedPageHeader,
  UnifiedSection,
  UnifiedGrid,
} from "../components/ui";

function MyPage() {
  return (
    <UnifiedPageContainer>
      <UnifiedPageHeader
        title="My Page"
        subtitle="Page description"
        action={<UnifiedButton>Add New</UnifiedButton>}
      />

      <UnifiedSection title="Content">
        <UnifiedGrid columns={{ xs: 1, sm: 2, md: 3 }}>
          <UnifiedCard title="Card 1">
            <UnifiedFormField type="text" label="Name" name="name" />
            <UnifiedButton variant="contained">Submit</UnifiedButton>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>
    </UnifiedPageContainer>
  );
}
```

## 🎨 Design System

### Spacing (8px base unit)

- `xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px, `xxl`: 48px, `xxxl`: 64px

### Border Radius

- `xs`: 4px, `sm`: 6px, `md`: 8px, `lg`: 12px, `xl`: 16px, `xxl`: 20px, `full`: 9999px

### Typography Scale

- `xs`: 12px, `sm`: 14px, `base`: 16px, `lg`: 18px, `xl`: 20px, `2xl`: 24px, `3xl`: 30px, `4xl`: 36px, `5xl`: 48px

### Transitions

- `fast`: 0.15s, `normal`: 0.2s, `slow`: 0.3s

## 📦 Components

### ✅ Unified Components (Recommended)

#### UnifiedCard

Replaces: `EnhancedCard`, `ContentCard`, `DashboardCard`

- Consistent styling across all card variations
- Interactive hover states
- Flexible sizing (small, medium, large)

#### UnifiedButton

Replaces: `EnhancedButton`, `AppButton`, `PrimaryButton`, `SecondaryButton`, `TextButton`

- Consistent hover and focus states
- Loading states built-in
- Accessible keyboard navigation

#### UnifiedFormField

Replaces: `EnhancedTextField`, `FormField`

- All input types in one component
- Consistent validation styling
- Built-in accessibility features

#### UnifiedLayout Components

- `UnifiedPageContainer`: Page-level container
- `UnifiedPageHeader`: Consistent page headers
- `UnifiedSection`: Content sections
- `UnifiedGrid`: Responsive grid system
- `UnifiedFlex`: Flexible layouts

### ⚠️ Legacy Components (Migrate When Possible)

These components still work but should be migrated to unified components for better consistency:

- `EnhancedCard` → `UnifiedCard`
- `ContentCard` → `UnifiedCard`
- `DashboardCard` → `UnifiedCard`
- `EnhancedButton` → `UnifiedButton`
- `AppButton` → `UnifiedButton`
- `EnhancedTextField` → `UnifiedFormField`
- `FormField` → `UnifiedFormField`
- `PageContainer` → `UnifiedPageContainer`
- `PageHeading` → `UnifiedPageHeader`

## 🔄 Migration Guide

### Step 1: Update Imports

```jsx
// Before
import { EnhancedCard, EnhancedButton } from "../components/ui";

// After
import { UnifiedCard, UnifiedButton } from "../components/ui";
```

### Step 2: Update Component Usage

```jsx
// Before
<EnhancedCard variant="elevated">
  <EnhancedButton variant="contained">
    Submit
  </EnhancedButton>
</EnhancedCard>

// After
<UnifiedCard variant="elevated">
  <UnifiedButton variant="contained">
    Submit
  </UnifiedButton>
</UnifiedCard>
```

### Step 3: Update Styling

```jsx
// Before
sx={{ padding: '16px', borderRadius: '8px' }}

// After
sx={{
  padding: theme => theme.spacing(designSystem.spacing.md / 8),
  borderRadius: theme => theme.spacing(designSystem.borderRadius.md / 8)
}}
```

## 🧪 Testing

View the component demo at `/ui-demo` (when implemented) or check `examples/UnifiedComponentsDemo.jsx` for comprehensive examples.

## 📋 Checklist for New Components

When creating new components:

- [ ] Use design system spacing values
- [ ] Use design system border radius values
- [ ] Use design system transitions
- [ ] Include proper focus states
- [ ] Add ARIA labels where needed
- [ ] Support keyboard navigation
- [ ] Follow the naming convention
- [ ] Add to the main index.js export
- [ ] Update this README if needed

## 🎯 Benefits of Migration

### Before (Inconsistent)

- Multiple card components with different styling
- Hardcoded spacing and border radius values
- Inconsistent hover and focus states
- Different transition timings
- Accessibility gaps

### After (Unified)

- Single card component with consistent variants
- Design system values throughout
- Consistent interactions across all components
- Standardized transitions
- Built-in accessibility features

## 🔧 Customization

### Theme Integration

The unified components integrate with the MUI theme system:

```jsx
import { createEnhancedTheme } from "../components/ui";

const theme = createEnhancedTheme("light"); // or 'dark'
```

### Design System Access

```jsx
import { designSystem } from "../components/ui";

// Use in custom components
const customSpacing = theme.spacing(designSystem.spacing.lg / 8);
```

## 📚 Resources

- [Style Guide](./STYLE_GUIDE.md) - Comprehensive design guidelines
- [Migration Helper](./migration-helper.js) - Utilities for migration
- [Component Demo](./examples/UnifiedComponentsDemo.jsx) - Live examples

## 🤝 Contributing

When contributing to the UI system:

1. Follow the established patterns
2. Use the design system values
3. Ensure accessibility compliance
4. Add examples to the demo page
5. Update documentation

## 📈 Roadmap

- [ ] Complete migration of all legacy components
- [ ] Add more layout utilities
- [ ] Enhance table components
- [ ] Add animation utilities
- [ ] Create component testing utilities
- [ ] Add Storybook integration

---

For questions or suggestions about the UI system, please refer to the [Style Guide](./STYLE_GUIDE.md) or reach out to the development team.
