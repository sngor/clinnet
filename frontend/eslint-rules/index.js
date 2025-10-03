/**
 * Custom ESLint rules for UI/UX modernization
 * Helps enforce design system usage and detect deprecated components
 */

module.exports = {
    rules: {
        'no-deprecated-components': require('./no-deprecated-components'),
        'no-inconsistent-styling': require('./no-inconsistent-styling')
    },
    configs: {
        recommended: {
            plugins: ['ui-modernization'],
            rules: {
                'ui-modernization/no-deprecated-components': 'warn',
                'ui-modernization/no-inconsistent-styling': 'warn'
            }
        },
        strict: {
            plugins: ['ui-modernization'],
            rules: {
                'ui-modernization/no-deprecated-components': ['error', {
                    autoFix: true,
                    showMigrationPath: true
                }],
                'ui-modernization/no-inconsistent-styling': ['error', {
                    enforceDesignTokens: true,
                    allowInlineStyles: false,
                    requireUnifiedComponents: true
                }]
            }
        }
    }
};