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
  - `PageContainer`: Outer page wrapper
  - `SectionContainer`: Content sections
  - `CardContainer`: Card-style containers
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
     ContentCard 
   } from '../components/ui';
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
  PrimaryButton 
} from '../components/ui';

function AppointmentsPage() {
  return (
    <Container maxWidth="xl" disableGutters>
      <PageHeading
        title="Appointments"
        subtitle="Manage patient appointments"
        action={
          <PrimaryButton startIcon={<AddIcon />}>
            New Appointment
          </PrimaryButton>
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