# UI Component System

This directory contains reusable UI components that ensure consistency across the application.

## Core UI Components

Located in the `ui` directory:

- **AppButton.jsx**: Consistent button components with various styles

  - `PrimaryButton`: Main call-to-action buttons
  - `SecondaryButton`: Alternative actions
  - `TextButton`: Subtle actions
  - `DangerButton`: Destructive actions
  - `AppIconButton`: Icon-only buttons

- **Typography.jsx**: Consistent text components

  - `PageTitle`: Main page headings
  - `SectionTitle`: Section headings
  - `SubsectionTitle`: Sub-section headings
  - `BodyText`: Main content text
  - `SecondaryText`: Supporting text
  - `LabelText`: Form labels and small headings
  - `Caption`: Small, supplementary text

- **Container.jsx**: Layout components

  - `PageContainer`: Outermost wrapper for pages (do not nest)
  - `SectionContainer`: For grouping content with spacing only (no visual border/shadow)
  - `CardContainer`: For content that needs a visual container (border/shadow)
  - **Do not nest CardContainer inside SectionContainer. Use only one container type at a time.**
  - `FlexBox`: Flexible layout box

- **PageHeading.jsx**: Consistent page headers

  - Title, optional subtitle, and optional action button
  - Consistent spacing and styling

- **SectionHeading.jsx**: Section headers within pages

  - Title, optional subtitle, and optional action button
  - Optional divider

- **DialogHeading.jsx**: Consistent dialog headers

  - Title with optional icon
  - Consistent styling for all dialogs

- **StatusChip.jsx**: Status indicators

  - Consistent color coding for different statuses
  - Uses the centralized status color utility

- **AppointmentCard.jsx**: Cards for displaying appointment information

  - Consistent layout for appointment details
  - Status indicator and optional action button

- **AppointmentList.jsx**: Lists for displaying appointments

  - Consistent layout for appointment lists
  - Status indicators and optional actions

- **ContentCard.jsx**: Card containers for content sections

  - Optional title and action button
  - Consistent padding and styling

- **DataTable.jsx**: Consistent data tables

  - Pagination, loading states, and empty states
  - Consistent styling for all tables

- **FormDialog.jsx**: Reusable form dialogs

  - Consistent layout for form dialogs
  - Submit and cancel buttons

- **EmptyState.jsx**: Empty state displays

  - Icon, title, description, and optional action
  - Consistent styling for empty states

- **LoadingIndicator.jsx**: Loading indicators
  - Consistent loading indicators with optional message
  - Different sizes for different contexts

## Usage Guidelines

1. **Import from the index file**:

   ```jsx
   import {
     PrimaryButton,
     SectionTitle,
     PageContainer,
     StatusChip,
     ContentCard,
   } from "../components/ui";
   ```

2. **Use appropriate components for their intended purpose**:

   - Use `PrimaryButton` for main actions
   - Use `SecondaryButton` for alternative actions
   - Use `StatusChip` for status indicators
   - Use `ContentCard` for content sections
   - Use appropriate typography components based on content hierarchy

3. **Maintain consistent spacing**:

   - Use the theme's spacing system (multiples of 8px)
   - Use the `FlexBox` component for flexible layouts with consistent spacing

4. **Follow the style guide**:
   - Reference the Style Guide page at `/style-guide` for examples
   - Maintain consistent colors, typography, and spacing

## Benefits

- **Consistency**: Ensures UI elements look the same across all pages
- **Maintainability**: Changes to components are reflected throughout the app
- **Efficiency**: Reduces duplicate code and styling
- **Accessibility**: Components are built with accessibility in mind

## Example

```jsx
import {
  PageHeading,
  ContentCard,
  AppointmentList,
  PrimaryButton,
} from "../components/ui";

function AppointmentsPage() {
  return (
    <Container maxWidth="xl" disableGutters>
      <PageHeading
        title="Appointments"
        subtitle="Manage patient appointments"
        action={
          <PrimaryButton startIcon={<AddIcon />}>New Appointment</PrimaryButton>
        }
      />

      <ContentCard title="Today's Appointments">
        <AppointmentList
          appointments={appointments}
          loading={loading}
          onAction={handleCheckIn}
          actionText="Check In"
        />
      </ContentCard>
    </Container>
  );
}
```

## Accessibility & Best Practices Checklist

- All interactive components (buttons, icon buttons, inputs) must:
  - Have visible focus styles (use theme or custom styles if needed)
  - Meet color contrast requirements (WCAG AA)
  - Support keyboard navigation (tab, enter, space)
  - Use `aria-label` for icon-only buttons or ambiguous actions
  - Use semantic HTML elements (e.g., `<button>`, not `<div>` for actions)
  - Provide PropTypes and JSDoc for all exported UI components

## Pattern for New UI Components

1. **Create the component in `src/components/ui/`**
2. **Add PropTypes and JSDoc for all props**
3. **Ensure accessibility (see checklist above)**
4. **Add a usage example as a comment at the top of the file**
5. **Export the component in `src/components/ui/index.js`**
6. **Document the component in this README if it is a core UI element**

## Responsiveness & Touch Targets

- All UI components and layouts must be responsive:
  - Test on desktop, tablet, and mobile screen sizes (use browser dev tools or real devices)
  - Use MUI's `Container`, `Box`, and theme breakpoints for layout
  - Use `maxWidth`, `fullWidth`, and responsive `sx` props for containers
  - Use `theme.spacing()` and avoid hardcoded pixel values for padding/margin
  - Use `flexWrap`, `direction`, and `gap` in `FlexBox` for flexible layouts
  - Prioritize important content and actions for smaller screens (e.g., stack vertically, hide less-important info)
- Interactive elements (buttons, icon buttons, inputs):
  - Minimum touch target size: 44x44px (per Apple/Google guidelines)
  - Use `size="large"` or increase padding for touchable elements on mobile
  - Ensure sufficient spacing between touch targets
- Typography:
  - Responsive font sizes are enabled via ThemeProvider (`responsiveFontSizes`)
  - Use theme typography variants for all text
- Continuously test UI on various screen sizes and devices

**Example:**

```jsx
<PageContainer sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
  <PrimaryButton size="large" sx={{ minWidth: 44, minHeight: 44 }}>
    Tap Me
  </PrimaryButton>
</PageContainer>
```
