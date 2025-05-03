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

## Usage Guidelines

1. **Import from the index file**:
   ```jsx
   import { PrimaryButton, SectionTitle, PageContainer } from '../components/ui';
   ```

2. **Use appropriate components for their intended purpose**:
   - Use `PrimaryButton` for main actions
   - Use `SecondaryButton` for alternative actions
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
  PageContainer, 
  SectionContainer, 
  PageTitle, 
  BodyText, 
  PrimaryButton 
} from '../components/ui';

function MyPage() {
  return (
    <PageContainer>
      <PageTitle>My Page Title</PageTitle>
      <SectionContainer>
        <BodyText>This is the main content of my page.</BodyText>
        <PrimaryButton>Submit</PrimaryButton>
      </SectionContainer>
    </PageContainer>
  );
}
```