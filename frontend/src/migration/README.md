# Migration Utilities and Legacy Cleanup

This directory contains comprehensive utilities for migrating from legacy UI components to the unified design system components. The migration system provides automated tools, development-time warnings, and validation utilities to ensure a smooth transition.

## Overview

The migration system consists of four main components:

1. **Component Migration Utilities** - Automated import replacement and component transformation
2. **Development-time Warnings** - ESLint rules and runtime warnings for deprecated components
3. **Legacy Cleanup** - Systematic removal of deprecated components and unused styles
4. **Migration Validation** - Completeness validation and accessibility compliance checking

## Files Structure

```
migration/
├── index.js                    # Main exports
├── migrationMappings.js        # Component mapping definitions
├── propMapper.js              # Prop transformation utilities
├── componentMigrator.js       # Automated import replacement
├── codemodRunner.js           # Bulk component transformation scripts
├── deprecationWarnings.js     # Runtime deprecation warnings
├── legacyCleanup.js          # Legacy component cleanup utilities
├── migrationValidator.js     # Migration validation and accessibility checks
└── README.md                 # This documentation
```

## Quick Start

### 1. Run Migration Analysis

```bash
# Generate migration report
node scripts/cleanup-legacy.js --dry-run --verbose

# Validate migration completeness
node scripts/validate-migration.js --verbose --save-report
```

### 2. Enable Development Warnings

The ESLint rules are automatically configured in `eslint.config.js`:

```javascript
'ui-modernization/no-deprecated-components': ['warn', {
  autoFix: false,
  showMigrationPath: true
}],
'ui-modernization/no-inconsistent-styling': ['warn', {
  enforceDesignTokens: true,
  allowInlineStyles: false,
  requireUnifiedComponents: true
}]
```

### 3. Run Automated Migration

```bash
# Interactive migration with confirmations
node scripts/cleanup-legacy.js --interactive

# Automated migration (creates backups)
node scripts/cleanup-legacy.js

# Dry run to preview changes
node scripts/cleanup-legacy.js --dry-run
```

## Component Migration Mappings

### Card Components

- `EnhancedCard` → `UnifiedCard` (with variant props)
- `ContentCard` → `UnifiedCard` (with composition)
- `DashboardCard` → `UnifiedCard` (with interactive variant)
- `PatientCard` → `UnifiedCard` (with custom content slots)
- `ServiceCard` → `UnifiedCard` (with action slots)

### Button Components

- `EnhancedButton` → `UnifiedButton` (with size/variant props)
- `AppButton` → `UnifiedButton` (with polymorphic rendering)
- `PrimaryButton` → `UnifiedButton` (variant="contained")
- `SecondaryButton` → `UnifiedButton` (variant="outlined")
- `TextButton` → `UnifiedButton` (variant="text")
- `DangerButton` → `UnifiedButton` (color="error")
- `LinkButton` → `UnifiedButton` (as="a" or as={Link})

### Form Components

- `EnhancedTextField` → `UnifiedFormField` (with type props)
- `FormField` → `UnifiedFormField` (with validation)
- `Input` → `UnifiedFormField` (with adornments)

### Table Components

- `DataTable` → `UnifiedTable` (with generic types)
- `EnhancedTable` → `UnifiedTable` (with column config)
- `ResponsiveTable` → `UnifiedTable` (with responsive props)

### Layout Components

- `PageLayout` → `UnifiedPageContainer`
- `DashboardPageLayout` → `UnifiedPageContainer` (maxWidth="lg")
- `ManagementPageLayout` → `UnifiedPageContainer` (maxWidth="xl")

## Usage Examples

### Programmatic Migration

```javascript
import { componentMigrator, propMapper } from "./migration";

// Migrate a single file
const result = await componentMigrator.migrateFile(
  "./src/components/MyComponent.jsx"
);

// Transform props for a component
const transformedProps = propMapper.transformProps("EnhancedCard", {
  elevation: 2,
  outlined: false,
  loading: true,
});

// Generate migration code
const newCode = propMapper.generateMigrationCode(
  "PrimaryButton",
  {
    size: "large",
    disabled: false,
  },
  "Click Me"
);
```

### Runtime Deprecation Warnings

```javascript
import { deprecationWarnings } from "./migration";

// Show deprecation warning
deprecationWarnings.showDeprecationWarning("EnhancedCard", {
  context: "MyComponent.jsx",
  showMigrationPath: true,
});

// Check if component is deprecated
const isDeprecated = deprecationWarnings.isDeprecated("EnhancedCard");

// Get migration information
const migrationInfo = deprecationWarnings.getMigrationInfo("EnhancedCard");
```

### Legacy Cleanup

```javascript
import { legacyCleanup } from "./migration";

// Find legacy components
const analysis = await legacyCleanup.findLegacyComponents("./src");

// Update import references
const result = await legacyCleanup.updateImportReferences(
  "./src/MyComponent.jsx"
);

// Generate cleanup report
const report = await legacyCleanup.generateCleanupReport("./src");
```

### Migration Validation

```javascript
import { migrationValidator } from "./migration";

// Check for broken references
const brokenRefs = await migrationValidator.checkBrokenReferences("./src");

// Validate accessibility
const a11yResults = await migrationValidator.validateAccessibility("./src");

// Generate complete validation report
const report = await migrationValidator.generateValidationReport("./src");
```

## ESLint Rules

### no-deprecated-components

Detects usage of deprecated UI components and provides migration guidance.

**Options:**

- `level`: 'error' | 'warn' (default: 'warn')
- `autoFix`: boolean (default: false)
- `showMigrationPath`: boolean (default: true)

**Examples:**

```javascript
// ❌ Will trigger warning
import { EnhancedCard } from "../components/ui";
<EnhancedCard title="Test" />;

// ✅ Migrated version
import { UnifiedCard } from "../components/ui/UnifiedCard";
<UnifiedCard title="Test" />;
```

### no-inconsistent-styling

Detects inconsistent styling patterns and enforces design system usage.

**Options:**

- `enforceDesignTokens`: boolean (default: true)
- `allowInlineStyles`: boolean (default: false)
- `requireUnifiedComponents`: boolean (default: true)

**Examples:**

```javascript
// ❌ Will trigger warning
<div style={{ margin: '16px', color: '#ff0000' }} />

// ✅ Using design tokens
<div style={{ margin: designSystem.spacing.md, color: designSystem.colors.error[500] }} />
```

## Scripts

### cleanup-legacy.js

Systematically removes deprecated components and unused styles.

**Usage:**

```bash
node scripts/cleanup-legacy.js [options]

Options:
  --dry-run      Run without making changes (preview mode)
  --verbose      Show detailed output
  --no-backup    Don't create backup files
  --interactive  Prompt for confirmation before each step
  --help         Show help message
```

**Features:**

- Identifies unused legacy component files
- Updates import references to unified components
- Removes deprecated component files safely
- Cleans up unused CSS and style definitions
- Creates backups before making changes

### validate-migration.js

Validates migration completeness and accessibility compliance.

**Usage:**

```bash
node scripts/validate-migration.js [options]

Options:
  --verbose      Show detailed output including individual issues
  --json         Output results in JSON format
  --save-report  Save validation report to file
  --help         Show help message
```

**Validation Checks:**

- Broken import references
- Undefined component usage
- Missing accessibility attributes
- Heading hierarchy validation
- Component test coverage
- Overall migration score calculation

## Migration Process

### Phase 1: Analysis

1. Run `cleanup-legacy.js --dry-run --verbose` to analyze current state
2. Review generated migration report
3. Identify components that need manual migration

### Phase 2: Automated Migration

1. Enable ESLint rules for development-time warnings
2. Run `cleanup-legacy.js --interactive` for guided migration
3. Update import references automatically
4. Remove unused legacy files

### Phase 3: Manual Cleanup

1. Address complex component migrations manually
2. Update prop usage based on migration mappings
3. Implement compound component patterns where needed
4. Clean up unused styles and CSS

### Phase 4: Validation

1. Run `validate-migration.js --verbose` to check completeness
2. Fix broken references and accessibility issues
3. Add missing tests for migrated components
4. Verify visual consistency

## Best Practices

### Before Migration

- Create a backup of your codebase
- Review component usage patterns
- Plan for complex component migrations
- Set up visual regression testing

### During Migration

- Migrate components incrementally
- Test each migration step
- Address ESLint warnings promptly
- Maintain accessibility standards

### After Migration

- Run validation scripts regularly
- Monitor for new deprecated component usage
- Keep migration mappings updated
- Document custom migration patterns

## Troubleshooting

### Common Issues

**Import Resolution Errors**

```javascript
// Problem: Relative import paths not resolving
import { UnifiedCard } from "../components/ui/UnifiedCard";

// Solution: Use absolute imports or check file structure
import { UnifiedCard } from "@/components/ui/UnifiedCard";
```

**Prop Transformation Issues**

```javascript
// Problem: Complex prop transformations
<EnhancedCard elevation={2} outlined={true} />

// Solution: Use compound components
<UnifiedCard variant="elevated">
  <UnifiedCard.Header>Title</UnifiedCard.Header>
  <UnifiedCard.Body>Content</UnifiedCard.Body>
</UnifiedCard>
```

**ESLint Rule Conflicts**

```javascript
// Problem: ESLint rules conflicting with existing code
// Solution: Configure rules in eslint.config.js
'ui-modernization/no-deprecated-components': ['warn', {
  autoFix: false, // Disable auto-fix if causing issues
  showMigrationPath: true
}]
```

### Getting Help

1. Check the migration mappings in `migrationMappings.js`
2. Review prop transformation logic in `propMapper.js`
3. Run validation scripts to identify specific issues
4. Use `--verbose` flags for detailed debugging information

## Contributing

When adding new migration mappings:

1. Update `migrationMappings.js` with component mapping
2. Add prop transformation logic if needed
3. Update ESLint rules to detect the new deprecated component
4. Add validation checks for the new unified component
5. Update this documentation

## Related Documentation

- [Design System Documentation](../design-system/README.md)
- [Unified Components Guide](../components/ui/README.md)
- [Accessibility Guidelines](../docs/accessibility.md)
- [Testing Strategy](../docs/testing.md)
