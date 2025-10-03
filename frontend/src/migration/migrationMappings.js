/**
 * Migration mappings for legacy components to unified components
 * Based on the design document migration strategy
 */

export const migrationMappings = {
    // Card Components
    'EnhancedCard': {
        unifiedComponent: 'UnifiedCard',
        importPath: '../components/ui/UnifiedCard',
        propMappings: {
            'elevation': 'variant', // elevation > 0 -> "elevated", else "default"
            'outlined': 'variant', // outlined: true -> "outlined"
            'interactive': 'interactive',
            'loading': 'loading',
            'error': 'error'
        },
        propTransforms: {
            'elevation': (value) => value > 0 ? 'elevated' : 'default',
            'outlined': (value) => value ? 'outlined' : 'default'
        },
        breakingChanges: [
            'elevation prop replaced with variant prop',
            'outlined prop replaced with variant prop',
            'Custom styling should use CSS custom properties'
        ]
    },

    'ContentCard': {
        unifiedComponent: 'UnifiedCard',
        importPath: '../components/ui/UnifiedCard',
        propMappings: {
            'title': 'title',
            'subtitle': 'subtitle',
            'children': 'children',
            'actions': 'actions'
        },
        propTransforms: {},
        breakingChanges: [
            'Use compound component pattern: UnifiedCard.Header, UnifiedCard.Body, UnifiedCard.Footer'
        ]
    },

    'DashboardCard': {
        unifiedComponent: 'UnifiedCard',
        importPath: '../components/ui/UnifiedCard',
        propMappings: {
            'title': 'title',
            'value': 'children', // Dashboard value becomes card content
            'icon': 'actions', // Icon moves to actions slot
            'onClick': 'onClick',
            'loading': 'loading'
        },
        propTransforms: {
            'variant': () => 'interactive' // Dashboard cards are typically interactive
        },
        breakingChanges: [
            'value prop replaced with children',
            'icon prop moved to actions slot',
            'Custom metric styling should use UnifiedCard composition'
        ]
    },

    'PatientCard': {
        unifiedComponent: 'UnifiedCard',
        importPath: '../components/ui/UnifiedCard',
        propMappings: {
            'patient': 'children', // Patient data becomes card content
            'onClick': 'onClick',
            'selected': 'className' // Handle selection through className
        },
        propTransforms: {
            'variant': () => 'interactive',
            'patient': (patient) => `Patient: ${patient.name}` // Transform patient object to display
        },
        breakingChanges: [
            'patient prop replaced with children - use compound components for patient data',
            'selected state should be handled through className or custom styling'
        ]
    },

    'ServiceCard': {
        unifiedComponent: 'UnifiedCard',
        importPath: '../components/ui/UnifiedCard',
        propMappings: {
            'service': 'children',
            'onEdit': 'actions',
            'onDelete': 'actions'
        },
        propTransforms: {
            'variant': () => 'default'
        },
        breakingChanges: [
            'service prop replaced with children - use compound components',
            'onEdit and onDelete should be combined into actions prop'
        ]
    },

    // Button Components
    'EnhancedButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'variant': 'variant',
            'size': 'size',
            'color': 'color',
            'loading': 'loading',
            'disabled': 'disabled',
            'fullWidth': 'fullWidth',
            'startIcon': 'startIcon',
            'endIcon': 'endIcon',
            'children': 'children'
        },
        propTransforms: {},
        breakingChanges: []
    },

    'AppButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'variant': 'variant',
            'size': 'size',
            'color': 'color',
            'disabled': 'disabled',
            'children': 'children'
        },
        propTransforms: {
            'variant': () => 'contained' // AppButton default variant
        },
        breakingChanges: []
    },

    'PrimaryButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'size': 'size',
            'disabled': 'disabled',
            'children': 'children'
        },
        propTransforms: {
            'variant': () => 'contained',
            'color': () => 'primary'
        },
        breakingChanges: []
    },

    'SecondaryButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'size': 'size',
            'disabled': 'disabled',
            'children': 'children'
        },
        propTransforms: {
            'variant': () => 'outlined',
            'color': () => 'primary'
        },
        breakingChanges: []
    },

    'TextButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'size': 'size',
            'disabled': 'disabled',
            'children': 'children'
        },
        propTransforms: {
            'variant': () => 'text'
        },
        breakingChanges: []
    },

    'DangerButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'variant': 'variant',
            'size': 'size',
            'disabled': 'disabled',
            'children': 'children'
        },
        propTransforms: {
            'color': () => 'error'
        },
        breakingChanges: []
    },

    'LinkButton': {
        unifiedComponent: 'UnifiedButton',
        importPath: '../components/ui/UnifiedButton',
        propMappings: {
            'to': 'href', // React Router Link to href
            'children': 'children'
        },
        propTransforms: {
            'as': () => 'a', // Render as anchor tag
            'variant': () => 'text'
        },
        breakingChanges: [
            'to prop replaced with href prop',
            'Use as="a" or as={Link} for navigation'
        ]
    },

    // Form Components
    'EnhancedTextField': {
        unifiedComponent: 'UnifiedFormField',
        importPath: '../components/ui/UnifiedFormField',
        propMappings: {
            'type': 'type',
            'label': 'label',
            'placeholder': 'placeholder',
            'helperText': 'helperText',
            'error': 'error',
            'required': 'required',
            'disabled': 'disabled',
            'fullWidth': 'fullWidth',
            'size': 'size',
            'variant': 'variant'
        },
        propTransforms: {},
        breakingChanges: []
    },

    'FormField': {
        unifiedComponent: 'UnifiedFormField',
        importPath: '../components/ui/UnifiedFormField',
        propMappings: {
            'type': 'type',
            'label': 'label',
            'placeholder': 'placeholder',
            'helperText': 'helperText',
            'error': 'error',
            'required': 'required',
            'disabled': 'disabled'
        },
        propTransforms: {},
        breakingChanges: []
    },

    'Input': {
        unifiedComponent: 'UnifiedFormField',
        importPath: '../components/ui/UnifiedFormField',
        propMappings: {
            'type': 'type',
            'placeholder': 'placeholder',
            'disabled': 'disabled'
        },
        propTransforms: {
            'variant': () => 'outlined'
        },
        breakingChanges: [
            'Basic Input component replaced with full FormField - add label and validation as needed'
        ]
    },

    // Table Components
    'DataTable': {
        unifiedComponent: 'UnifiedTable',
        importPath: '../components/ui/UnifiedTable',
        propMappings: {
            'data': 'data',
            'columns': 'columns',
            'loading': 'loading',
            'error': 'error',
            'sortable': 'sortable',
            'selectable': 'selectable',
            'pagination': 'pagination'
        },
        propTransforms: {},
        breakingChanges: [
            'Column configuration may need updates for new column definition format'
        ]
    },

    'EnhancedTable': {
        unifiedComponent: 'UnifiedTable',
        importPath: '../components/ui/UnifiedTable',
        propMappings: {
            'data': 'data',
            'columns': 'columns',
            'loading': 'loading',
            'sortable': 'sortable',
            'selectable': 'selectable',
            'responsive': 'responsive'
        },
        propTransforms: {},
        breakingChanges: []
    },

    'ResponsiveTable': {
        unifiedComponent: 'UnifiedTable',
        importPath: '../components/ui/UnifiedTable',
        propMappings: {
            'data': 'data',
            'columns': 'columns',
            'responsive': 'responsive',
            'mobileBreakpoint': 'mobileBreakpoint'
        },
        propTransforms: {
            'responsive': () => true
        },
        breakingChanges: []
    },

    // Layout Components
    'PageLayout': {
        unifiedComponent: 'UnifiedPageContainer',
        importPath: '../components/ui/Layout/UnifiedPageContainer',
        propMappings: {
            'maxWidth': 'maxWidth',
            'padding': 'padding',
            'children': 'children'
        },
        propTransforms: {},
        breakingChanges: [
            'Use UnifiedPageHeader separately for page headers'
        ]
    },

    'DashboardPageLayout': {
        unifiedComponent: 'UnifiedPageContainer',
        importPath: '../components/ui/Layout/UnifiedPageContainer',
        propMappings: {
            'children': 'children'
        },
        propTransforms: {
            'maxWidth': () => 'lg'
        },
        breakingChanges: [
            'Use UnifiedPageHeader separately for page headers'
        ]
    },

    'ManagementPageLayout': {
        unifiedComponent: 'UnifiedPageContainer',
        importPath: '../components/ui/Layout/UnifiedPageContainer',
        propMappings: {
            'children': 'children'
        },
        propTransforms: {
            'maxWidth': () => 'xl'
        },
        breakingChanges: [
            'Use UnifiedPageHeader separately for page headers'
        ]
    }
};

/**
 * Get migration mapping for a component
 */
export const getMigrationMapping = (componentName) => {
    return migrationMappings[componentName] || null;
};

/**
 * Get all legacy component names
 */
export const getLegacyComponentNames = () => {
    return Object.keys(migrationMappings);
};

/**
 * Check if a component needs migration
 */
export const needsMigration = (componentName) => {
    return componentName in migrationMappings;
};