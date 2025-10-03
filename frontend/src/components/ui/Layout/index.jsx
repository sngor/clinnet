/**
 * Unified Layout System
 * 
 * A comprehensive layout system providing consistent page structure,
 * typography hierarchy, and responsive grid/flex layouts.
 */

// Layout Components
export { default as UnifiedPageContainer } from './UnifiedPageContainer.jsx';
export { default as UnifiedPageHeader } from './UnifiedPageHeader.jsx';
export { default as UnifiedSection } from './UnifiedSection.jsx';

// Grid and Flex Systems
export { default as UnifiedGrid } from './UnifiedGrid.jsx';
export { default as UnifiedFlex } from './UnifiedFlex.jsx';

// Typography System
export { default as UnifiedTypography } from './UnifiedTypography.jsx';
export {
  Heading,
  Display,
  Body,
  Label,
  Caption,
  Code,
} from './UnifiedTypography.jsx';

// Typography Utilities
export {
  validateHeadingHierarchy,
  getNextHeadingLevel,
  getTypographyStyles,
  HeadingHierarchy,
} from './typographyUtils.js';

// Layout Presets for common page structures
export const PageLayouts = {
  // Standard page with header and content
  Standard: ({ title, subtitle, action, breadcrumbs, children, ...props }) => (
    <UnifiedPageContainer {...props}>
      <UnifiedPageHeader
        title={title}
        subtitle={subtitle}
        action={action}
        breadcrumbs={breadcrumbs}
      />
      {children}
    </UnifiedPageContainer>
  ),

  // Hero page with centered content
  Hero: ({ title, subtitle, action, children, ...props }) => (
    <UnifiedPageContainer {...props}>
      <UnifiedPageHeader
        title={title}
        subtitle={subtitle}
        action={action}
        variant="hero"
      />
      {children}
    </UnifiedPageContainer>
  ),

  // Compact page with minimal header
  Compact: ({ title, action, children, ...props }) => (
    <UnifiedPageContainer {...props}>
      <UnifiedPageHeader
        title={title}
        action={action}
        variant="compact"
      />
      {children}
    </UnifiedPageContainer>
  ),
};