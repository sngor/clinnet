# Page Layout Consistency Guide

## Overview

This guide ensures all pages in the Clinnet EMR application have consistent width, spacing, and behavior patterns.

## 🎯 Standardized Page Layouts

### 1. **StandardPageLayout** (Default)

- **Use for**: General pages, detail views, reports
- **Max Width**: `lg` (1024px)
- **Padding**: Responsive (16px mobile, 24px tablet, 32px desktop)

```jsx
import { StandardPageLayout } from "../components/ui";

<StandardPageLayout
  title="Page Title"
  subtitle="Page description"
  action={<UnifiedButton>Action</UnifiedButton>}
>
  {/* Page content */}
</StandardPageLayout>;
```

### 2. **DashboardPageLayout**

- **Use for**: Dashboard pages with metrics and overview
- **Max Width**: `xl` (1280px)
- **Features**: Wider layout for dashboard cards and charts

```jsx
import { DashboardPageLayout } from "../components/ui";

<DashboardPageLayout title="Dashboard" subtitle="System overview">
  {/* Dashboard content */}
</DashboardPageLayout>;
```

### 3. **ManagementPageLayout**

- **Use for**: List pages, management interfaces, data tables
- **Max Width**: `xl` (1280px)
- **Features**: Extra wide for tables and grids

```jsx
import { ManagementPageLayout } from "../components/ui";

<ManagementPageLayout
  title="User Management"
  subtitle="Manage system users"
  action={<UnifiedButton>Add User</UnifiedButton>}
>
  {/* Management content */}
</ManagementPageLayout>;
```

### 4. **FormPageLayout**

- **Use for**: Create/edit forms, data entry
- **Max Width**: `md` (768px)
- **Features**: Narrower for better form readability

```jsx
import { FormPageLayout } from "../components/ui";

<FormPageLayout
  title="Add New Patient"
  subtitle="Enter patient information"
  showBackButton
  onBack={handleBack}
>
  {/* Form content */}
</FormPageLayout>;
```

### 5. **DetailPageLayout**

- **Use for**: Individual record views, profile pages
- **Max Width**: `lg` (1024px)
- **Features**: Balanced width for detailed information

```jsx
import { DetailPageLayout } from "../components/ui";

<DetailPageLayout
  title="Patient Details"
  subtitle="John Doe - ID: 12345"
  action={<UnifiedButton>Edit</UnifiedButton>}
>
  {/* Detail content */}
</DetailPageLayout>;
```

### 6. **SettingsPageLayout**

- **Use for**: Settings, preferences, configuration
- **Max Width**: `md` (768px)
- **Features**: Narrow layout for settings forms

```jsx
import { SettingsPageLayout } from "../components/ui";

<SettingsPageLayout
  title="Account Settings"
  subtitle="Manage your account preferences"
>
  {/* Settings content */}
</SettingsPageLayout>;
```

## 📏 Consistent Spacing System

### Container Padding

- **Mobile (xs)**: 16px horizontal, 16px vertical
- **Tablet (sm)**: 24px horizontal, 24px vertical
- **Desktop (md+)**: 32px horizontal, 24px vertical

### Content Spacing

- **Section Gap**: 24px mobile, 32px desktop
- **Component Gap**: 16px mobile, 24px desktop
- **Form Field Gap**: 16px consistent

### Header Spacing

- **Bottom Margin**: 24px mobile, 32px desktop
- **Title to Subtitle**: 8px
- **Header to Content**: 24px mobile, 32px desktop

## 🔄 Migration Checklist

### ✅ Updated Pages (Using Standardized Layouts)

- `PatientManagementPage.jsx` → `ManagementPageLayout`
- `UserManagementPage.jsx` → `ManagementPageLayout`
- `NewPatientPage.jsx` → `FormPageLayout`
- `AccountSettingsPage.jsx` → `SettingsPageLayout`
- `AdminServicesPage.jsx` → `ManagementPageLayout`
- `DiagnosticsPage.jsx` → `StandardPageLayout`
- `FrontdeskCheckoutPage.jsx` → `StandardPageLayout`

### ⚠️ Pages Needing Updates

- `AdminDashboard.jsx` → Should use `DashboardPageLayout`
- `DoctorDashboard.jsx` → Should use `DashboardPageLayout`
- `FrontdeskDashboard.jsx` → Should use `DashboardPageLayout`
- `PatientDetailPage.jsx` → Should use `DetailPageLayout`
- `AdminPatientsPage.jsx` → Should use `ManagementPageLayout`
- `DoctorPatientsPage.jsx` → Should use `ManagementPageLayout`
- `AdminAppointmentsPage.jsx` → Should use `ManagementPageLayout`
- `DoctorAppointmentsPage.jsx` → Should use `ManagementPageLayout`
- `FrontdeskAppointmentsPage.jsx` → Should use `ManagementPageLayout`
- `SettingsPage.jsx` → Should use `SettingsPageLayout`
- `AdminReportsPage.jsx` → Should use `StandardPageLayout`

## 🎨 Layout Selection Guide

### Choose Layout Based on Page Type:

| Page Type       | Layout                 | Max Width   | Use Case                |
| --------------- | ---------------------- | ----------- | ----------------------- |
| Dashboard       | `DashboardPageLayout`  | xl (1280px) | Metrics, overview cards |
| List/Management | `ManagementPageLayout` | xl (1280px) | Tables, grids, lists    |
| Forms           | `FormPageLayout`       | md (768px)  | Create/edit forms       |
| Details         | `DetailPageLayout`     | lg (1024px) | Individual records      |
| Settings        | `SettingsPageLayout`   | md (768px)  | Configuration pages     |
| General         | `StandardPageLayout`   | lg (1024px) | Default for other pages |

### Content Type Guidelines:

**Wide Layouts (xl - 1280px)**

- Data tables with many columns
- Dashboard with multiple cards
- Management interfaces
- Analytics and reports with charts

**Medium Layouts (lg - 1024px)**

- Detail views with tabs
- General content pages
- Mixed content layouts
- Documentation pages

**Narrow Layouts (md - 768px)**

- Forms and data entry
- Settings and preferences
- Single-column content
- Mobile-optimized layouts

## 🔧 Implementation Examples

### Before (Inconsistent)

```jsx
// Different max widths and padding
<PageLayout maxWidth="xl">
<PageContainer sx={{ px: 2 }}>
<Container maxWidth="lg" sx={{ py: 4 }}>
```

### After (Consistent)

```jsx
// Standardized layouts with automatic sizing
<ManagementPageLayout>  // xl width, consistent padding
<FormPageLayout>        // md width, form-optimized
<DashboardPageLayout>   // xl width, dashboard-optimized
```

## 📱 Responsive Behavior

All standardized layouts automatically provide:

- **Mobile First**: Optimized for small screens
- **Responsive Padding**: Scales with screen size
- **Flexible Content**: Adapts to container width
- **Consistent Breakpoints**: xs, sm, md, lg, xl
- **Touch Friendly**: Appropriate spacing for touch interfaces

## 🎯 Benefits Achieved

### Consistency

- ✅ Uniform max widths across page types
- ✅ Consistent padding and margins
- ✅ Standardized header layouts
- ✅ Predictable spacing patterns

### User Experience

- ✅ Familiar navigation patterns
- ✅ Optimal reading widths
- ✅ Responsive design
- ✅ Accessible layouts

### Developer Experience

- ✅ Easy to choose correct layout
- ✅ Automatic responsive behavior
- ✅ Consistent component APIs
- ✅ Reduced custom styling

## 🚀 Next Steps

1. **Complete Migration**: Update remaining pages to use standardized layouts
2. **Remove Legacy**: Phase out old `PageLayout` and `PageContainer` usage
3. **Documentation**: Update component documentation
4. **Testing**: Verify responsive behavior across devices
5. **Team Training**: Share guidelines with development team

## 📋 Quick Reference

```jsx
// Import the appropriate layout
import {
  StandardPageLayout, // Default
  DashboardPageLayout, // Dashboards
  ManagementPageLayout, // Lists/Tables
  FormPageLayout, // Forms
  DetailPageLayout, // Details
  SettingsPageLayout, // Settings
} from "../components/ui";

// Use with consistent props
<LayoutComponent
  title="Page Title"
  subtitle="Page description"
  action={<UnifiedButton>Action</UnifiedButton>}
  loading={loading}
  error={error}
  showBackButton={showBack}
  onBack={handleBack}
>
  {/* Page content */}
</LayoutComponent>;
```

This standardization ensures all pages have consistent width, behavior, and user experience across the entire Clinnet EMR application.
