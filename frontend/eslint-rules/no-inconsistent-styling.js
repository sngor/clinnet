/**
 * ESLint rule to detect inconsistent styling patterns
 * Enforces design system usage and consistent styling practices
 */

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Detect inconsistent styling patterns and enforce design system usage',
            category: 'Best Practices',
            recommended: true
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    enforceDesignTokens: {
                        type: 'boolean',
                        default: true
                    },
                    allowInlineStyles: {
                        type: 'boolean',
                        default: false
                    },
                    requireUnifiedComponents: {
                        type: 'boolean',
                        default: true
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            hardcodedSpacing: 'Hardcoded spacing value "{{value}}" found. Use design system spacing tokens instead.',
            hardcodedColor: 'Hardcoded color value "{{value}}" found. Use design system color tokens instead.',
            hardcodedFontSize: 'Hardcoded font size "{{value}}" found. Use design system typography tokens instead.',
            inlineStyles: 'Inline styles detected. Use design system components or CSS classes instead.',
            inconsistentButton: 'Inconsistent button styling. Use UnifiedButton component for consistent design.',
            inconsistentCard: 'Inconsistent card styling. Use UnifiedCard component for consistent design.',
            inconsistentTable: 'Inconsistent table styling. Use UnifiedTable component for consistent design.',
            mixedUnits: 'Mixed CSS units detected ({{units}}). Use consistent units from design system.',
            magicNumbers: 'Magic number "{{value}}" detected in styling. Use design system tokens instead.'
        }
    },

    create(context) {
        const options = context.options[0] || {};
        const {
            enforceDesignTokens = true,
            allowInlineStyles = false,
            requireUnifiedComponents = true
        } = options;

        // Design system token patterns
        const designTokenPatterns = {
            spacing: /^(xs|sm|md|lg|xl|xxl|xxxl)$/,
            colors: /^(primary|secondary|neutral|success|warning|error)\.(50|100|200|300|400|500|600|700|800|900)$/,
            typography: /^(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/,
            borderRadius: /^(xs|sm|md|lg|xl|full)$/
        };

        // Hardcoded value patterns to detect
        const hardcodedPatterns = {
            spacing: /^(\d+)(px|rem|em)$/,
            color: /^(#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\()/,
            fontSize: /^(\d+)(px|rem|em|pt)$/
        };

        // Magic numbers that should use design tokens
        const commonMagicNumbers = ['4', '8', '12', '16', '20', '24', '32', '48', '64'];

        /**
         * Check if a value is a hardcoded spacing value
         */
        const isHardcodedSpacing = (value) => {
            return hardcodedPatterns.spacing.test(value) && !designTokenPatterns.spacing.test(value);
        };

        /**
         * Check if a value is a hardcoded color value
         */
        const isHardcodedColor = (value) => {
            return hardcodedPatterns.color.test(value);
        };

        /**
         * Check if a value is a hardcoded font size
         */
        const isHardcodedFontSize = (value) => {
            return hardcodedPatterns.fontSize.test(value) && !designTokenPatterns.typography.test(value);
        };

        /**
         * Check for magic numbers in CSS values
         */
        const hasMagicNumbers = (value) => {
            const numbers = value.match(/\d+/g) || [];
            return numbers.some(num => commonMagicNumbers.includes(num));
        };

        /**
         * Extract CSS properties from JSX style objects
         */
        const extractStyleProperties = (node) => {
            const properties = [];

            if (node.type === 'ObjectExpression') {
                node.properties.forEach(prop => {
                    if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                        const key = prop.key.name;
                        let value = '';

                        if (prop.value.type === 'Literal') {
                            value = prop.value.value.toString();
                        } else if (prop.value.type === 'TemplateLiteral') {
                            value = prop.value.quasis.map(q => q.value.cooked).join('${...}');
                        }

                        properties.push({ key, value, node: prop });
                    }
                });
            }

            return properties;
        };

        /**
         * Check for inconsistent component usage
         */
        const checkInconsistentComponents = (node) => {
            const elementName = node.name.name;
            const attributes = node.attributes || [];

            // Check for button-like elements that should use UnifiedButton
            if (['button', 'Button'].includes(elementName)) {
                const hasCustomStyling = attributes.some(attr =>
                    attr.name && ['style', 'className', 'sx'].includes(attr.name.name)
                );

                if (hasCustomStyling && requireUnifiedComponents) {
                    context.report({
                        node,
                        messageId: 'inconsistentButton'
                    });
                }
            }

            // Check for card-like elements that should use UnifiedCard
            if (['div', 'Card', 'Paper'].includes(elementName)) {
                const hasCardStyling = attributes.some(attr => {
                    if (attr.name && attr.name.name === 'className' && attr.value) {
                        const className = attr.value.value || '';
                        return className.includes('card') || className.includes('paper');
                    }
                    return false;
                });

                if (hasCardStyling && requireUnifiedComponents) {
                    context.report({
                        node,
                        messageId: 'inconsistentCard'
                    });
                }
            }

            // Check for table elements that should use UnifiedTable
            if (['table', 'Table'].includes(elementName)) {
                if (requireUnifiedComponents) {
                    context.report({
                        node,
                        messageId: 'inconsistentTable'
                    });
                }
            }
        };

        return {
            // Check JSX style attributes
            JSXAttribute(node) {
                if (node.name.name === 'style' && !allowInlineStyles) {
                    context.report({
                        node,
                        messageId: 'inlineStyles'
                    });
                    return;
                }

                if (node.name.name === 'style' && node.value && node.value.expression) {
                    const styleProperties = extractStyleProperties(node.value.expression);

                    styleProperties.forEach(({ key, value, node: propNode }) => {
                        // Check spacing properties
                        if (['margin', 'padding', 'gap', 'top', 'right', 'bottom', 'left'].some(prop => key.includes(prop))) {
                            if (isHardcodedSpacing(value) && enforceDesignTokens) {
                                context.report({
                                    node: propNode,
                                    messageId: 'hardcodedSpacing',
                                    data: { value }
                                });
                            }
                        }

                        // Check color properties
                        if (['color', 'backgroundColor', 'borderColor'].some(prop => key.includes(prop))) {
                            if (isHardcodedColor(value) && enforceDesignTokens) {
                                context.report({
                                    node: propNode,
                                    messageId: 'hardcodedColor',
                                    data: { value }
                                });
                            }
                        }

                        // Check font size properties
                        if (key === 'fontSize') {
                            if (isHardcodedFontSize(value) && enforceDesignTokens) {
                                context.report({
                                    node: propNode,
                                    messageId: 'hardcodedFontSize',
                                    data: { value }
                                });
                            }
                        }

                        // Check for magic numbers
                        if (hasMagicNumbers(value)) {
                            const numbers = value.match(/\d+/g) || [];
                            const magicNumbers = numbers.filter(num => commonMagicNumbers.includes(num));

                            if (magicNumbers.length > 0) {
                                context.report({
                                    node: propNode,
                                    messageId: 'magicNumbers',
                                    data: { value: magicNumbers.join(', ') }
                                });
                            }
                        }
                    });
                }
            },

            // Check JSX elements for inconsistent component usage
            JSXOpeningElement(node) {
                if (node.name.type === 'JSXIdentifier') {
                    checkInconsistentComponents(node);
                }
            },

            // Check template literals for CSS-in-JS
            TemplateLiteral(node) {
                if (node.parent && node.parent.type === 'TaggedTemplateExpression') {
                    const tag = node.parent.tag;

                    // Check if this is a styled-components or emotion template
                    if (tag.type === 'Identifier' && ['css', 'styled'].includes(tag.name)) {
                        const cssContent = node.quasis.map(q => q.value.cooked).join('${...}');

                        // Check for hardcoded values in CSS
                        const lines = cssContent.split('\n');
                        lines.forEach((line, index) => {
                            const trimmed = line.trim();

                            // Check spacing values
                            const spacingMatch = trimmed.match(/(margin|padding|gap|top|right|bottom|left):\s*([^;]+)/);
                            if (spacingMatch && isHardcodedSpacing(spacingMatch[2].trim())) {
                                context.report({
                                    node,
                                    messageId: 'hardcodedSpacing',
                                    data: { value: spacingMatch[2].trim() }
                                });
                            }

                            // Check color values
                            const colorMatch = trimmed.match(/(color|background-color|border-color):\s*([^;]+)/);
                            if (colorMatch && isHardcodedColor(colorMatch[2].trim())) {
                                context.report({
                                    node,
                                    messageId: 'hardcodedColor',
                                    data: { value: colorMatch[2].trim() }
                                });
                            }

                            // Check font-size values
                            const fontSizeMatch = trimmed.match(/font-size:\s*([^;]+)/);
                            if (fontSizeMatch && isHardcodedFontSize(fontSizeMatch[1].trim())) {
                                context.report({
                                    node,
                                    messageId: 'hardcodedFontSize',
                                    data: { value: fontSizeMatch[1].trim() }
                                });
                            }
                        });
                    }
                }
            }
        };
    }
};