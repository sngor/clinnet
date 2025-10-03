/**
 * Migration Helper Script
 * 
 * This script helps identify components that should be migrated to the unified system.
 * Run this to get a report of components that can be updated for better consistency.
 */

const componentMigrations = {
  // Card components
  'EnhancedCard': {
    newComponent: 'UnifiedCard',
    changes: [
      'Import from UnifiedCard instead of EnhancedCard',
      'Props remain mostly the same',
      'New size prop available: small, medium, large'
    ]
  },
  'ContentCard': {
    newComponent: 'UnifiedCard',
    changes: [
      'Replace ContentCard with UnifiedCard',
      'title prop works the same way',
      'noPadding prop replaced with size="small"'
    ]
  },
  'DashboardCard': {
    newComponent: 'UnifiedCard',
    changes: [
      'Replace DashboardCard with UnifiedCard',
      'Use interactive prop for hover effects',
      'Combine with UnifiedButton for actions'
    ]
  },

  // Button components
  'EnhancedButton': {
    newComponent: 'UnifiedButton',
    changes: [
      'Import from UnifiedButton instead of EnhancedButton',
      'All props remain the same',
      'Better accessibility and focus states'
    ]
  },
  'AppButton': {
    newComponent: 'UnifiedButton',
    changes: [
      'Replace AppButton variants with UnifiedButton',
      'PrimaryButton → UnifiedButton variant="contained"',
      'SecondaryButton → UnifiedButton variant="outlined"',
      'TextButton → UnifiedButton variant="text"'
    ]
  },

  // Form components
  'EnhancedTextField': {
    newComponent: 'UnifiedFormField',
    changes: [
      'Replace EnhancedTextField with UnifiedFormField',
      'type="text" is default',
      'Better validation and error states'
    ]
  },
  'FormField': {
    newComponent: 'UnifiedFormField',
    changes: [
      'Replace FormField with UnifiedFormField',
      'All field types supported',
      'Consistent styling across all input types'
    ]
  },

  // Layout components
  'PageContainer': {
    newComponent: 'UnifiedPageContainer',
    changes: [
      'Replace PageContainer with UnifiedPageContainer',
      'Better responsive behavior',
      'Consistent spacing system'
    ]
  },
  'PageHeading': {
    newComponent: 'UnifiedPageHeader',
    changes: [
      'Replace PageHeading with UnifiedPageHeader',
      'Better mobile responsiveness',
      'Consistent typography scale'
    ]
  }
};

const layoutMigrations = {
  'hardcoded spacing': {
    issue: 'Using hardcoded px values instead of design system',
    solution: 'Use designSystem.spacing values',
    example: 'padding: "16px" → padding: theme.spacing(designSystem.spacing.md / 8)'
  },
  'custom border radius': {
    issue: 'Using custom border radius values',
    solution: 'Use designSystem.borderRadius values',
    example: 'borderRadius: "8px" → borderRadius: theme.spacing(designSystem.borderRadius.md / 8)'
  },
  'custom transitions': {
    issue: 'Using custom transition values',
    solution: 'Use designSystem.transitions values',
    example: 'transition: "all 0.2s ease" → transition: designSystem.transitions.normal'
  }
};

/**
 * Generates a migration report for a given file content
 */
function generateMigrationReport(fileContent, filePath) {
  const report = {
    file: filePath,
    components: [],
    styling: [],
    suggestions: []
  };

  // Check for component usage
  Object.entries(componentMigrations).forEach(([oldComponent, migration]) => {
    const regex = new RegExp(`<${oldComponent}|import.*${oldComponent}`, 'g');
    if (regex.test(fileContent)) {
      report.components.push({
        component: oldComponent,
        migration: migration
      });
    }
  });

  // Check for styling issues
  Object.entries(layoutMigrations).forEach(([issue, details]) => {
    let hasIssue = false;
    
    if (issue === 'hardcoded spacing' && /padding:\s*["']?\d+px/.test(fileContent)) {
      hasIssue = true;
    }
    if (issue === 'custom border radius' && /borderRadius:\s*["']?\d+px/.test(fileContent)) {
      hasIssue = true;
    }
    if (issue === 'custom transitions' && /transition:\s*["'][^"']*ease/.test(fileContent)) {
      hasIssue = true;
    }

    if (hasIssue) {
      report.styling.push(details);
    }
  });

  // Generate suggestions
  if (report.components.length > 0) {
    report.suggestions.push('Consider migrating to unified components for better consistency');
  }
  if (report.styling.length > 0) {
    report.suggestions.push('Update styling to use the design system values');
  }

  return report;
}

/**
 * Example usage:
 * 
 * const fileContent = fs.readFileSync('path/to/component.jsx', 'utf8');
 * const report = generateMigrationReport(fileContent, 'path/to/component.jsx');
 * console.log(report);
 */

export { generateMigrationReport, componentMigrations, layoutMigrations };