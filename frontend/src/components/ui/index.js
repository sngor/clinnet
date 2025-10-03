// Design System
export { default as designSystem } from "./DesignSystem";
export { createEnhancedTheme } from "./DesignSystem";

// Unified Components (New - Consistent Design)
export { default as UnifiedCard } from './Cards/UnifiedCard';
export { default as UnifiedButton, UnifiedIconButton } from './Buttons/UnifiedButton';
export { default as UnifiedFormField } from './Forms/UnifiedFormField';
export { 
  UnifiedPageContainer, 
  UnifiedPageHeader, 
  UnifiedSection, 
  UnifiedGrid, 
  UnifiedFlex 
} from './Layout/UnifiedLayout';

// Standardized Page Layouts
export { 
  default as StandardPageLayout,
  DashboardPageLayout,
  FormPageLayout,
  ManagementPageLayout,
  DetailPageLayout,
  SettingsPageLayout,
} from './Layout/StandardPageLayout';

// Spacing Utilities
export {
  VerticalSpacer,
  HorizontalSpacer,
  Stack,
  GridContainer,
  ResponsiveContainer,
  SectionDivider,
  ContentWrapper,
  FlexRow,
  FlexColumn,
  ResponsiveGrid,
  AspectRatio,
  StickyContainer,
  getSpacing,
  getResponsiveSpacing,
  spacingPatterns,
} from './Layout/SpacingUtilities';

// Enhanced Components
export { default as EnhancedCard } from "./Cards/EnhancedCard";
export { default as EnhancedButton } from "./Buttons/EnhancedButton";
export { EnhancedIconButton } from "./Buttons/EnhancedButton";
export { default as EnhancedTextField } from "./Forms/EnhancedTextField";
export { default as EnhancedTable } from "./Tables/EnhancedTable";

// Layout Components
export { default as PageLayout } from "./Layout/PageLayout";
export { default as PageContainer } from './PageContainer';
export { default as PageHeading } from './PageHeading';
export { SectionContainer, CardContainer, FlexBox } from './Container';

// Existing Components
export { default as AppButton, PrimaryButton, SecondaryButton, TextButton, DangerButton, AppIconButton } from './AppButton';
export { PageTitle, SectionTitle, SubsectionTitle, BodyText, SecondaryText, LabelText, Caption } from './Typography';
export { default as SectionHeading } from './SectionHeading';
export { default as DialogHeading } from './DialogHeading';
export { default as StatusChip } from './StatusChip';
export { default as AppointmentCard } from './AppointmentCard';
export { default as AppointmentList } from './AppointmentList';
export { default as ContentCard } from './ContentCard';
export { default as DataTable } from './DataTable';
export { default as FormDialog } from './FormDialog';
export { default as EmptyState } from './EmptyState';
export { default as LoadingIndicator } from './LoadingIndicator';
export { StyledTableContainer, tableHeaderStyle, actionButtonsStyle } from './TableStyles';
export { default as FormField } from './FormField';
export { default as FormLayout } from './FormLayout';
export { 
  FormContainer, 
  FormSection, 
  StyledTextField, 
  StyledFormControl, 
  formGridProps, 
  commonFieldProps 
} from './FormStyles';
export { default as TableContainer } from '../TableContainer';
export { default as ThemeColorAudit } from './ThemeColorAudit';