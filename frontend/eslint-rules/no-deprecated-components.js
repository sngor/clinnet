/**
 * ESLint rule to detect deprecated component usage
 * Provides migration guidance during development
 */

// Legacy component names that should be migrated
const LEGACY_COMPONENTS = [
    'EnhancedCard', 'ContentCard', 'DashboardCard', 'PatientCard', 'ServiceCard',
    'EnhancedButton', 'AppButton', 'PrimaryButton', 'SecondaryButton', 'TextButton', 'DangerButton', 'LinkButton',
    'EnhancedTextField', 'FormField', 'Input',
    'DataTable', 'EnhancedTable', 'ResponsiveTable',
    'PageLayout', 'DashboardPageLayout', 'ManagementPageLayout'
];

// Migration mappings for components
const MIGRATION_MAPPINGS = {
    'EnhancedCard': { unified: 'UnifiedCard', importPath: '../components/ui/UnifiedCard' },
    'ContentCard': { unified: 'UnifiedCard', importPath: '../components/ui/UnifiedCard' },
    'DashboardCard': { unified: 'UnifiedCard', importPath: '../components/ui/UnifiedCard' },
    'PatientCard': { unified: 'UnifiedCard', importPath: '../components/ui/UnifiedCard' },
    'ServiceCard': { unified: 'UnifiedCard', importPath: '../components/ui/UnifiedCard' },
    'EnhancedButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'AppButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'PrimaryButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'SecondaryButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'TextButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'DangerButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'LinkButton': { unified: 'UnifiedButton', importPath: '../components/ui/UnifiedButton' },
    'EnhancedTextField': { unified: 'UnifiedFormField', importPath: '../components/ui/UnifiedFormField' },
    'FormField': { unified: 'UnifiedFormField', importPath: '../components/ui/UnifiedFormField' },
    'Input': { unified: 'UnifiedFormField', importPath: '../components/ui/UnifiedFormField' },
    'DataTable': { unified: 'UnifiedTable', importPath: '../components/ui/UnifiedTable' },
    'EnhancedTable': { unified: 'UnifiedTable', importPath: '../components/ui/UnifiedTable' },
    'ResponsiveTable': { unified: 'UnifiedTable', importPath: '../components/ui/UnifiedTable' },
    'PageLayout': { unified: 'UnifiedPageContainer', importPath: '../components/ui/Layout/UnifiedPageContainer' },
    'DashboardPageLayout': { unified: 'UnifiedPageContainer', importPath: '../components/ui/Layout/UnifiedPageContainer' },
    'ManagementPageLayout': { unified: 'UnifiedPageContainer', importPath: '../components/ui/Layout/UnifiedPageContainer' }
};

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow usage of deprecated UI components',
            category: 'Best Practices',
            recommended: true
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    level: {
                        type: 'string',
                        enum: ['error', 'warn'],
                        default: 'warn'
                    },
                    autoFix: {
                        type: 'boolean',
                        default: false
                    },
                    showMigrationPath: {
                        type: 'boolean',
                        default: true
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            deprecatedComponent: 'Component "{{componentName}}" is deprecated. {{migrationMessage}}',
            deprecatedImport: 'Import of deprecated component "{{componentName}}" found. {{migrationMessage}}'
        }
    },

    create(context) {
        const options = context.options[0] || {};
        const {
            level = 'warn',
            autoFix = false,
            showMigrationPath = true
        } = options;

        /**
         * Generate migration message for a component
         */
        const getMigrationMessage = (componentName) => {
            if (!showMigrationPath) return '';

            const mapping = MIGRATION_MAPPINGS[componentName];
            if (!mapping) return '';

            return `Use ${mapping.unified} instead.`;
        };

        /**
         * Generate fix for deprecated import
         */
        const fixDeprecatedImport = (node, componentName) => {
            if (!autoFix) return null;

            const mapping = MIGRATION_MAPPINGS[componentName];
            if (!mapping) return null;

            return (fixer) => {
                // Handle named imports
                if (node.type === 'ImportSpecifier') {
                    const importDeclaration = node.parent;
                    const specifiers = importDeclaration.specifiers;

                    // If this is the only specifier, replace the entire import
                    if (specifiers.length === 1) {
                        return fixer.replaceText(
                            importDeclaration,
                            `import { ${mapping.unified} } from '${mapping.importPath}';`
                        );
                    } else {
                        // Replace just this specifier
                        return [
                            fixer.replaceText(node, mapping.unified),
                            fixer.insertTextAfter(
                                importDeclaration,
                                `\nimport { ${mapping.unified} } from '${mapping.importPath}';`
                            )
                        ];
                    }
                }

                // Handle default imports
                if (node.type === 'ImportDefaultSpecifier') {
                    const importDeclaration = node.parent;
                    return fixer.replaceText(
                        importDeclaration,
                        `import { ${mapping.unified} } from '${mapping.importPath}';`
                    );
                }

                return null;
            };
        };

        /**
         * Generate fix for deprecated JSX element
         */
        const fixDeprecatedJSXElement = (node, componentName) => {
            if (!autoFix) return null;

            const mapping = MIGRATION_MAPPINGS[componentName];
            if (!mapping) return null;

            return (fixer) => {
                const fixes = [];

                // Replace opening tag
                if (node.openingElement) {
                    fixes.push(
                        fixer.replaceText(
                            node.openingElement.name,
                            mapping.unified
                        )
                    );
                }

                // Replace closing tag if it exists
                if (node.closingElement) {
                    fixes.push(
                        fixer.replaceText(
                            node.closingElement.name,
                            mapping.unified
                        )
                    );
                }

                return fixes;
            };
        };

        return {
            // Check import declarations
            ImportDeclaration(node) {
                node.specifiers.forEach(specifier => {
                    const componentName = specifier.local.name;

                    if (LEGACY_COMPONENTS.includes(componentName)) {
                        const migrationMessage = getMigrationMessage(componentName);

                        context.report({
                            node: specifier,
                            messageId: 'deprecatedImport',
                            data: {
                                componentName,
                                migrationMessage
                            },
                            fix: fixDeprecatedImport(specifier, componentName)
                        });
                    }
                });
            },

            // Check JSX element usage
            JSXElement(node) {
                if (node.openingElement.name.type === 'JSXIdentifier') {
                    const componentName = node.openingElement.name.name;

                    if (LEGACY_COMPONENTS.includes(componentName)) {
                        const migrationMessage = getMigrationMessage(componentName);

                        context.report({
                            node: node.openingElement.name,
                            messageId: 'deprecatedComponent',
                            data: {
                                componentName,
                                migrationMessage
                            },
                            fix: fixDeprecatedJSXElement(node, componentName)
                        });
                    }
                }
            },

            // Check self-closing JSX elements
            JSXSelfClosingElement(node) {
                if (node.name.type === 'JSXIdentifier') {
                    const componentName = node.name.name;

                    if (LEGACY_COMPONENTS.includes(componentName)) {
                        const migrationMessage = getMigrationMessage(componentName);

                        context.report({
                            node: node.name,
                            messageId: 'deprecatedComponent',
                            data: {
                                componentName,
                                migrationMessage
                            },
                            fix: (fixer) => {
                                const mapping = MIGRATION_MAPPINGS[componentName];
                                if (!mapping || !autoFix) return null;

                                return fixer.replaceText(node.name, mapping.unified);
                            }
                        });
                    }
                }
            }
        };
    }
};