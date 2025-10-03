/**
 * Codemod scripts for bulk component updates
 * Provides automated transformation scripts for complex migration scenarios
 */

import fs from 'fs';
import path from 'path';
import { transformProps, generateMigrationCode } from './propMapper';
import { getMigrationMapping } from './migrationMappings';

/**
 * Parse JSX component from string
 * @param {string} jsxString - JSX component as string
 * @returns {Object} Parsed component information
 */
const parseJSXComponent = (jsxString) => {
    const componentMatch = jsxString.match(/<(\w+)([^>]*?)(?:\/>|>(.*?)<\/\1>)/s);

    if (!componentMatch) {
        return null;
    }

    const [, componentName, propsString, children] = componentMatch;
    const props = {};

    // Parse props
    if (propsString) {
        const propMatches = propsString.matchAll(/(\w+)(?:=(?:{([^}]+)}|"([^"]+)"))?/g);
        for (const match of propMatches) {
            const [, propName, jsValue, stringValue] = match;
            if (jsValue) {
                try {
                    props[propName] = JSON.parse(jsValue);
                } catch {
                    props[propName] = jsValue; // Keep as string if not valid JSON
                }
            } else if (stringValue) {
                props[propName] = stringValue;
            } else {
                props[propName] = true; // Boolean prop
            }
        }
    }

    return {
        componentName,
        props,
        children: children ? children.trim() : null
    };
};

/**
 * Transform JSX component to unified component
 * @param {string} jsxString - Original JSX component string
 * @returns {Object} Transformation result
 */
export const transformJSXComponent = (jsxString) => {
    const parsed = parseJSXComponent(jsxString);

    if (!parsed) {
        return {
            success: false,
            error: 'Could not parse JSX component'
        };
    }

    const { componentName, props, children } = parsed;
    const mapping = getMigrationMapping(componentName);

    if (!mapping) {
        return {
            success: false,
            error: `No migration mapping found for ${componentName}`
        };
    }

    const transformedProps = transformProps(componentName, props);
    const newJSX = generateMigrationCode(componentName, props, children);

    return {
        success: true,
        original: jsxString,
        transformed: newJSX,
        componentName,
        unifiedComponent: mapping.unifiedComponent,
        props: transformedProps,
        breakingChanges: mapping.breakingChanges || []
    };
};

/**
 * Codemod for Card component migrations
 * Handles complex card transformations including compound component patterns
 */
export const cardMigrationCodemod = (fileContent) => {
    let updatedContent = fileContent;
    const transformations = [];

    // Transform EnhancedCard with complex content to compound components
    const enhancedCardRegex = /<EnhancedCard([^>]*?)>(.*?)<\/EnhancedCard>/gs;

    updatedContent = updatedContent.replace(enhancedCardRegex, (match, propsString, content) => {
        const props = {};

        // Parse props
        if (propsString) {
            const propMatches = propsString.matchAll(/(\w+)(?:=(?:{([^}]+)}|"([^"]+)"))?/g);
            for (const propMatch of propMatches) {
                const [, propName, jsValue, stringValue] = propMatch;
                if (jsValue) {
                    props[propName] = jsValue;
                } else if (stringValue) {
                    props[propName] = stringValue;
                } else {
                    props[propName] = true;
                }
            }
        }

        // Determine variant based on props
        let variant = 'default';
        if (props.elevation && props.elevation !== '0') {
            variant = 'elevated';
        } else if (props.outlined) {
            variant = 'outlined';
        } else if (props.interactive) {
            variant = 'interactive';
        }

        // Build new component
        const newProps = [];
        if (variant !== 'default') newProps.push(`variant="${variant}"`);
        if (props.loading) newProps.push('loading');
        if (props.error) newProps.push(`error="${props.error}"`);
        if (props.onClick) newProps.push(`onClick={${props.onClick}}`);

        const propsStr = newProps.length > 0 ? ' ' + newProps.join(' ') : '';

        // Check if content has title/header structure
        const hasTitle = content.includes('CardHeader') || content.includes('Typography') && content.includes('variant="h');

        if (hasTitle) {
            // Use compound component pattern
            const result = `<UnifiedCard${propsStr}>
  <UnifiedCard.Header>
    ${content.replace(/<CardHeader[^>]*>|<\/CardHeader>/g, '').replace(/<Typography[^>]*variant="h[^"]*"[^>]*>([^<]+)<\/Typography>/, '$1')}
  </UnifiedCard.Header>
  <UnifiedCard.Body>
    ${content.replace(/<CardHeader.*?<\/CardHeader>/s, '').replace(/<Typography[^>]*variant="h[^"]*"[^>]*>.*?<\/Typography>/s, '')}
  </UnifiedCard.Body>
</UnifiedCard>`;

            transformations.push({
                type: 'card-compound',
                original: match,
                transformed: result
            });

            return result;
        } else {
            // Simple card transformation
            const result = `<UnifiedCard${propsStr}>
  ${content}
</UnifiedCard>`;

            transformations.push({
                type: 'card-simple',
                original: match,
                transformed: result
            });

            return result;
        }
    });

    return {
        content: updatedContent,
        transformations
    };
};

/**
 * Codemod for Button component migrations
 * Handles button variant and prop transformations
 */
export const buttonMigrationCodemod = (fileContent) => {
    let updatedContent = fileContent;
    const transformations = [];

    // Button component mappings
    const buttonMappings = {
        'PrimaryButton': { variant: 'contained', color: 'primary' },
        'SecondaryButton': { variant: 'outlined', color: 'primary' },
        'TextButton': { variant: 'text' },
        'DangerButton': { variant: 'contained', color: 'error' }
    };

    Object.entries(buttonMappings).forEach(([legacyButton, defaultProps]) => {
        const buttonRegex = new RegExp(`<${legacyButton}([^>]*?)(?:\\/>|>(.*?)<\\/${legacyButton}>)`, 'gs');

        updatedContent = updatedContent.replace(buttonRegex, (match, propsString, children) => {
            const props = [];

            // Add default props
            Object.entries(defaultProps).forEach(([key, value]) => {
                props.push(`${key}="${value}"`);
            });

            // Parse and preserve existing props
            if (propsString) {
                const propMatches = propsString.matchAll(/(\w+)(?:=(?:{([^}]+)}|"([^"]+)"))?/g);
                for (const propMatch of propMatches) {
                    const [, propName, jsValue, stringValue] = propMatch;
                    if (jsValue) {
                        props.push(`${propName}={${jsValue}}`);
                    } else if (stringValue) {
                        props.push(`${propName}="${stringValue}"`);
                    } else {
                        props.push(propName);
                    }
                }
            }

            const propsStr = props.length > 0 ? ' ' + props.join(' ') : '';
            const result = children
                ? `<UnifiedButton${propsStr}>${children}</UnifiedButton>`
                : `<UnifiedButton${propsStr} />`;

            transformations.push({
                type: 'button',
                legacy: legacyButton,
                original: match,
                transformed: result
            });

            return result;
        });
    });

    return {
        content: updatedContent,
        transformations
    };
};

/**
 * Codemod for Table component migrations
 * Handles table column configuration updates
 */
export const tableMigrationCodemod = (fileContent) => {
    let updatedContent = fileContent;
    const transformations = [];

    // Transform DataTable and EnhancedTable to UnifiedTable
    const tableRegex = /<(DataTable|EnhancedTable|ResponsiveTable)([^>]*?)(?:\/>|>(.*?)<\/\1>)/gs;

    updatedContent = updatedContent.replace(tableRegex, (match, tableName, propsString, children) => {
        const props = [];
        let needsColumnUpdate = false;

        // Parse existing props
        if (propsString) {
            const propMatches = propsString.matchAll(/(\w+)(?:=(?:{([^}]+)}|"([^"]+)"))?/g);
            for (const propMatch of propMatches) {
                const [, propName, jsValue, stringValue] = propMatch;

                if (propName === 'columns' && jsValue) {
                    // Check if columns need updating to new format
                    needsColumnUpdate = true;
                    props.push(`${propName}={${jsValue}}`);
                } else if (jsValue) {
                    props.push(`${propName}={${jsValue}}`);
                } else if (stringValue) {
                    props.push(`${propName}="${stringValue}"`);
                } else {
                    props.push(propName);
                }
            }
        }

        // Add responsive prop for ResponsiveTable
        if (tableName === 'ResponsiveTable') {
            props.push('responsive');
        }

        const propsStr = props.length > 0 ? ' ' + props.join(' ') : '';
        const result = children
            ? `<UnifiedTable${propsStr}>${children}</UnifiedTable>`
            : `<UnifiedTable${propsStr} />`;

        transformations.push({
            type: 'table',
            legacy: tableName,
            original: match,
            transformed: result,
            needsColumnUpdate
        });

        return result;
    });

    return {
        content: updatedContent,
        transformations
    };
};

/**
 * Codemod for Layout component migrations
 * Handles page layout transformations
 */
export const layoutMigrationCodemod = (fileContent) => {
    let updatedContent = fileContent;
    const transformations = [];

    // Transform layout components
    const layoutMappings = {
        'PageLayout': 'UnifiedPageContainer',
        'DashboardPageLayout': 'UnifiedPageContainer',
        'ManagementPageLayout': 'UnifiedPageContainer'
    };

    Object.entries(layoutMappings).forEach(([legacyLayout, unifiedLayout]) => {
        const layoutRegex = new RegExp(`<${legacyLayout}([^>]*?)(?:\\/>|>(.*?)<\\/${legacyLayout}>)`, 'gs');

        updatedContent = updatedContent.replace(layoutRegex, (match, propsString, children) => {
            const props = [];

            // Add default maxWidth based on legacy component
            if (legacyLayout === 'DashboardPageLayout') {
                props.push('maxWidth="lg"');
            } else if (legacyLayout === 'ManagementPageLayout') {
                props.push('maxWidth="xl"');
            }

            // Parse existing props
            if (propsString) {
                const propMatches = propsString.matchAll(/(\w+)(?:=(?:{([^}]+)}|"([^"]+)"))?/g);
                for (const propMatch of propMatches) {
                    const [, propName, jsValue, stringValue] = propMatch;
                    if (jsValue) {
                        props.push(`${propName}={${jsValue}}`);
                    } else if (stringValue) {
                        props.push(`${propName}="${stringValue}"`);
                    } else {
                        props.push(propName);
                    }
                }
            }

            const propsStr = props.length > 0 ? ' ' + props.join(' ') : '';
            const result = children
                ? `<${unifiedLayout}${propsStr}>${children}</${unifiedLayout}>`
                : `<${unifiedLayout}${propsStr} />`;

            transformations.push({
                type: 'layout',
                legacy: legacyLayout,
                original: match,
                transformed: result
            });

            return result;
        });
    });

    return {
        content: updatedContent,
        transformations
    };
};

/**
 * Run all codemods on file content
 * @param {string} fileContent - File content to transform
 * @returns {Object} Complete transformation result
 */
export const runAllCodemods = (fileContent) => {
    let content = fileContent;
    const allTransformations = [];

    // Run each codemod
    const cardResult = cardMigrationCodemod(content);
    content = cardResult.content;
    allTransformations.push(...cardResult.transformations);

    const buttonResult = buttonMigrationCodemod(content);
    content = buttonResult.content;
    allTransformations.push(...buttonResult.transformations);

    const tableResult = tableMigrationCodemod(content);
    content = tableResult.content;
    allTransformations.push(...tableResult.transformations);

    const layoutResult = layoutMigrationCodemod(content);
    content = layoutResult.content;
    allTransformations.push(...layoutResult.transformations);

    return {
        content,
        transformations: allTransformations,
        hasChanges: allTransformations.length > 0
    };
};

/**
 * Apply codemods to a file
 * @param {string} filePath - Path to the file
 * @param {Object} options - Codemod options
 * @returns {Promise<Object>} Codemod result
 */
export const applyCodemodsToFile = async (filePath, options = {}) => {
    const { dryRun = false, createBackup = true } = options;

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = runAllCodemods(fileContent);

        if (result.hasChanges && !dryRun) {
            if (createBackup) {
                const backupPath = `${filePath}.codemod.backup`;
                fs.writeFileSync(backupPath, fileContent);
            }
            fs.writeFileSync(filePath, result.content);
        }

        return {
            success: true,
            filePath,
            transformations: result.transformations,
            hasChanges: result.hasChanges,
            dryRun
        };
    } catch (error) {
        return {
            success: false,
            filePath,
            error: error.message
        };
    }
};

/**
 * Apply codemods to multiple files
 * @param {string[]} filePaths - Array of file paths
 * @param {Object} options - Codemod options
 * @returns {Promise<Object>} Bulk codemod result
 */
export const applyCodemodsToFiles = async (filePaths, options = {}) => {
    const results = [];
    const summary = {
        totalFiles: filePaths.length,
        transformedFiles: 0,
        totalTransformations: 0,
        errors: 0
    };

    for (const filePath of filePaths) {
        const result = await applyCodemodsToFile(filePath, options);
        results.push(result);

        if (result.success) {
            if (result.hasChanges) {
                summary.transformedFiles++;
                summary.totalTransformations += result.transformations.length;
            }
        } else {
            summary.errors++;
        }
    }

    return {
        summary,
        results
    };
};

export default {
    transformJSXComponent,
    cardMigrationCodemod,
    buttonMigrationCodemod,
    tableMigrationCodemod,
    layoutMigrationCodemod,
    runAllCodemods,
    applyCodemodsToFile,
    applyCodemodsToFiles
};