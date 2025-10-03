/**
 * Prop mapping utilities for component migration
 * Handles prop transformation and validation during migration
 */

import { getMigrationMapping } from './migrationMappings';

/**
 * Transform props from legacy component to unified component
 * @param {string} legacyComponentName - Name of the legacy component
 * @param {Object} legacyProps - Props from the legacy component
 * @returns {Object} Transformed props for unified component
 */
export const transformProps = (legacyComponentName, legacyProps) => {
    const mapping = getMigrationMapping(legacyComponentName);

    if (!mapping) {
        console.warn(`No migration mapping found for component: ${legacyComponentName}`);
        return legacyProps;
    }

    const transformedProps = {};
    const { propMappings, propTransforms } = mapping;

    // Transform mapped props
    Object.entries(legacyProps).forEach(([legacyProp, value]) => {
        const unifiedProp = propMappings[legacyProp];

        if (unifiedProp) {
            // Apply transformation if available
            if (propTransforms[legacyProp]) {
                transformedProps[unifiedProp] = propTransforms[legacyProp](value);
            } else {
                transformedProps[unifiedProp] = value;
            }
        } else {
            // Keep unmapped props as-is (with warning)
            console.warn(`Unmapped prop "${legacyProp}" in ${legacyComponentName} migration`);
            transformedProps[legacyProp] = value;
        }
    });

    // Apply default transforms (props that don't exist in legacy but needed in unified)
    Object.entries(propTransforms).forEach(([prop, transform]) => {
        if (!(prop in legacyProps) && typeof transform === 'function') {
            // Only apply if the transform doesn't require input value
            try {
                const defaultValue = transform();
                if (defaultValue !== undefined) {
                    const unifiedProp = propMappings[prop] || prop;
                    transformedProps[unifiedProp] = defaultValue;
                }
            } catch (e) {
                // Transform requires input value, skip
            }
        }
    });

    return transformedProps;
};

/**
 * Generate prop mapping report for a component migration
 * @param {string} legacyComponentName - Name of the legacy component
 * @param {Object} legacyProps - Props from the legacy component
 * @returns {Object} Migration report with warnings and breaking changes
 */
export const generateMigrationReport = (legacyComponentName, legacyProps) => {
    const mapping = getMigrationMapping(legacyComponentName);

    if (!mapping) {
        return {
            success: false,
            error: `No migration mapping found for component: ${legacyComponentName}`
        };
    }

    const report = {
        success: true,
        legacyComponent: legacyComponentName,
        unifiedComponent: mapping.unifiedComponent,
        importPath: mapping.importPath,
        transformedProps: transformProps(legacyComponentName, legacyProps),
        warnings: [],
        breakingChanges: mapping.breakingChanges || []
    };

    // Check for unmapped props
    Object.keys(legacyProps).forEach(prop => {
        if (!(prop in mapping.propMappings)) {
            report.warnings.push(`Unmapped prop: "${prop}" - may need manual migration`);
        }
    });

    // Check for complex transformations
    Object.entries(mapping.propTransforms).forEach(([prop, transform]) => {
        if (prop in legacyProps) {
            report.warnings.push(`Prop "${prop}" has custom transformation - verify result`);
        }
    });

    return report;
};

/**
 * Validate transformed props against unified component requirements
 * @param {string} unifiedComponentName - Name of the unified component
 * @param {Object} transformedProps - Transformed props
 * @returns {Object} Validation result
 */
export const validateTransformedProps = (unifiedComponentName, transformedProps) => {
    const validation = {
        valid: true,
        errors: [],
        warnings: []
    };

    // Component-specific validation rules
    switch (unifiedComponentName) {
        case 'UnifiedCard':
            if (transformedProps.variant && !['default', 'elevated', 'flat', 'outlined', 'interactive'].includes(transformedProps.variant)) {
                validation.errors.push(`Invalid variant: ${transformedProps.variant}`);
                validation.valid = false;
            }
            break;

        case 'UnifiedButton':
            if (transformedProps.variant && !['contained', 'outlined', 'text', 'ghost'].includes(transformedProps.variant)) {
                validation.errors.push(`Invalid variant: ${transformedProps.variant}`);
                validation.valid = false;
            }
            if (transformedProps.size && !['xs', 'sm', 'md', 'lg', 'xl'].includes(transformedProps.size)) {
                validation.errors.push(`Invalid size: ${transformedProps.size}`);
                validation.valid = false;
            }
            if (transformedProps.color && !['primary', 'secondary', 'success', 'warning', 'error'].includes(transformedProps.color)) {
                validation.errors.push(`Invalid color: ${transformedProps.color}`);
                validation.valid = false;
            }
            break;

        case 'UnifiedFormField':
            if (transformedProps.type && !['text', 'email', 'password', 'number', 'select', 'textarea', 'checkbox', 'radio', 'switch', 'file'].includes(transformedProps.type)) {
                validation.errors.push(`Invalid type: ${transformedProps.type}`);
                validation.valid = false;
            }
            if (transformedProps.variant && !['outlined', 'filled', 'standard'].includes(transformedProps.variant)) {
                validation.errors.push(`Invalid variant: ${transformedProps.variant}`);
                validation.valid = false;
            }
            break;

        case 'UnifiedTable':
            if (!transformedProps.data || !Array.isArray(transformedProps.data)) {
                validation.warnings.push('data prop should be an array');
            }
            if (!transformedProps.columns || !Array.isArray(transformedProps.columns)) {
                validation.errors.push('columns prop is required and should be an array');
                validation.valid = false;
            }
            break;

        case 'UnifiedPageContainer':
            if (transformedProps.maxWidth && !['sm', 'md', 'lg', 'xl', 'full'].includes(transformedProps.maxWidth)) {
                validation.errors.push(`Invalid maxWidth: ${transformedProps.maxWidth}`);
                validation.valid = false;
            }
            break;
    }

    return validation;
};

/**
 * Generate migration code snippet for a component
 * @param {string} legacyComponentName - Name of the legacy component
 * @param {Object} legacyProps - Props from the legacy component
 * @param {string} children - Component children as string
 * @returns {string} Code snippet for the migrated component
 */
export const generateMigrationCode = (legacyComponentName, legacyProps, children = '') => {
    const mapping = getMigrationMapping(legacyComponentName);

    if (!mapping) {
        return `// No migration available for ${legacyComponentName}`;
    }

    const transformedProps = transformProps(legacyComponentName, legacyProps);
    const { unifiedComponent } = mapping;

    // Generate props string
    const propsString = Object.entries(transformedProps)
        .map(([key, value]) => {
            if (typeof value === 'string') {
                return `${key}="${value}"`;
            } else if (typeof value === 'boolean') {
                return value ? key : '';
            } else {
                return `${key}={${JSON.stringify(value)}}`;
            }
        })
        .filter(Boolean)
        .join(' ');

    // Generate component code
    if (children) {
        return `<${unifiedComponent}${propsString ? ' ' + propsString : ''}>\n  ${children}\n</${unifiedComponent}>`;
    } else {
        return `<${unifiedComponent}${propsString ? ' ' + propsString : ''} />`;
    }
};

export default {
    transformProps,
    generateMigrationReport,
    validateTransformedProps,
    generateMigrationCode
};