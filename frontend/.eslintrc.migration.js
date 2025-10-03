/**
 * ESLint configuration for UI migration rules
 * Use this configuration to enable migration-specific linting
 */

module.exports = {
    extends: ['./eslint.config.js'],
    plugins: ['ui-modernization'],
    rules: {
        // UI Modernization rules
        'ui-modernization/no-deprecated-components': ['warn', {
            autoFix: false, // Set to true for automatic fixes
            showMigrationPath: true
        }],
        'ui-modernization/no-inconsistent-styling': ['warn', {
            enforceDesignTokens: true,
            allowInlineStyles: false,
            requireUnifiedComponents: true
        }],
    }
};