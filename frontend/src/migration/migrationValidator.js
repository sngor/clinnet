/**
 * Migration validation utilities
 * Ensures migration completeness and validates accessibility compliance
 */

import fs from 'fs';
import path from 'path';
import { getLegacyComponentNames, getMigrationMapping } from './migrationMappings';

/**
 * Check for broken references after migration
 * @param {string} directory - Directory to check
 * @returns {Promise<Object>} Broken references analysis
 */
export const checkBrokenReferences = async (directory) => {
    const brokenImports = [];
    const brokenComponents = [];
    const missingFiles = [];

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Check for broken imports
                const importRegex = /import\s+(?:{([^}]+)}|([^,\s]+)(?:,\s*{([^}]+)})?)\s+from\s+['"]([^'"]+)['"]/g;
                let match;

                while ((match = importRegex.exec(content)) !== null) {
                    const [, namedImports, defaultImport, additionalNamed, importPath] = match;

                    // Resolve import path
                    let resolvedPath;
                    if (importPath.startsWith('.')) {
                        resolvedPath = path.resolve(path.dirname(itemPath), importPath);

                        // Try different extensions
                        const extensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
                        let exists = false;

                        for (const ext of extensions) {
                            const fullPath = resolvedPath + ext;
                            if (fs.existsSync(fullPath)) {
                                exists = true;
                                break;
                            }
                        }

                        if (!exists) {
                            brokenImports.push({
                                file: itemPath,
                                importPath,
                                resolvedPath,
                                line: content.substring(0, match.index).split('\n').length
                            });
                        }
                    }
                }

                // Check for undefined component usage
                const jsxRegex = /<(\w+)[^>]*>/g;
                let jsxMatch;

                while ((jsxMatch = jsxRegex.exec(content)) !== null) {
                    const componentName = jsxMatch[1];

                    // Skip HTML elements
                    if (componentName.toLowerCase() === componentName) continue;

                    // Check if component is imported or defined
                    const isImported = new RegExp(`import.*${componentName}.*from`).test(content);
                    const isDefined = new RegExp(`(const|let|var|function)\\s+${componentName}`).test(content);

                    if (!isImported && !isDefined) {
                        brokenComponents.push({
                            file: itemPath,
                            component: componentName,
                            line: content.substring(0, jsxMatch.index).split('\n').length
                        });
                    }
                }
            }
        });
    };

    searchDirectory(directory);

    return {
        brokenImports,
        brokenComponents,
        missingFiles,
        summary: {
            totalBrokenImports: brokenImports.length,
            totalBrokenComponents: brokenComponents.length,
            totalMissingFiles: missingFiles.length,
            isValid: brokenImports.length === 0 && brokenComponents.length === 0 && missingFiles.length === 0
        }
    };
};

/**
 * Validate accessibility compliance across migrated components
 * @param {string} directory - Directory to check
 * @returns {Promise<Object>} Accessibility validation results
 */
export const validateAccessibility = async (directory) => {
    const accessibilityIssues = [];
    const recommendations = [];

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Check for missing alt attributes on images
                const imgRegex = /<img[^>]*>/gi;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(content)) !== null) {
                    if (!imgMatch[0].includes('alt=')) {
                        accessibilityIssues.push({
                            file: itemPath,
                            type: 'missing-alt',
                            element: imgMatch[0],
                            line: content.substring(0, imgMatch.index).split('\n').length,
                            severity: 'error',
                            message: 'Image missing alt attribute'
                        });
                    }
                }

                // Check for missing labels on form inputs
                const inputRegex = /<input[^>]*>/gi;
                let inputMatch;
                while ((inputMatch = inputRegex.exec(content)) !== null) {
                    const inputElement = inputMatch[0];
                    if (!inputElement.includes('aria-label=') && !inputElement.includes('aria-labelledby=')) {
                        // Check if there's a nearby label
                        const surroundingContent = content.substring(
                            Math.max(0, inputMatch.index - 200),
                            Math.min(content.length, inputMatch.index + inputElement.length + 200)
                        );

                        if (!surroundingContent.includes('<label')) {
                            accessibilityIssues.push({
                                file: itemPath,
                                type: 'missing-label',
                                element: inputElement,
                                line: content.substring(0, inputMatch.index).split('\n').length,
                                severity: 'error',
                                message: 'Input missing label or aria-label'
                            });
                        }
                    }
                }

                // Check for missing button text or aria-label
                const buttonRegex = /<button[^>]*>(.*?)<\/button>/gi;
                let buttonMatch;
                while ((buttonMatch = buttonRegex.exec(content)) !== null) {
                    const [fullMatch, buttonContent] = buttonMatch;
                    const hasAriaLabel = fullMatch.includes('aria-label=');
                    const hasTextContent = buttonContent.trim().length > 0 && !/</.test(buttonContent.trim());
                    const hasAriaLabelledBy = fullMatch.includes('aria-labelledby=');

                    if (!hasAriaLabel && !hasTextContent && !hasAriaLabelledBy) {
                        accessibilityIssues.push({
                            file: itemPath,
                            type: 'missing-button-text',
                            element: fullMatch,
                            line: content.substring(0, buttonMatch.index).split('\n').length,
                            severity: 'error',
                            message: 'Button missing accessible text content'
                        });
                    }
                }

                // Check for proper heading hierarchy
                const headingRegex = /<h([1-6])[^>]*>/gi;
                const headings = [];
                let headingMatch;
                while ((headingMatch = headingRegex.exec(content)) !== null) {
                    headings.push({
                        level: parseInt(headingMatch[1]),
                        line: content.substring(0, headingMatch.index).split('\n').length
                    });
                }

                // Validate heading hierarchy
                for (let i = 1; i < headings.length; i++) {
                    const current = headings[i];
                    const previous = headings[i - 1];

                    if (current.level > previous.level + 1) {
                        accessibilityIssues.push({
                            file: itemPath,
                            type: 'heading-hierarchy',
                            line: current.line,
                            severity: 'warning',
                            message: `Heading level ${current.level} follows h${previous.level}, skipping levels`
                        });
                    }
                }

                // Check for color-only information
                const colorOnlyRegex = /(red|green|blue|yellow|orange|purple)\s+(text|color|background)/gi;
                let colorMatch;
                while ((colorMatch = colorRegex.exec(content)) !== null) {
                    recommendations.push({
                        file: itemPath,
                        type: 'color-only-info',
                        line: content.substring(0, colorMatch.index).split('\n').length,
                        severity: 'info',
                        message: 'Ensure information is not conveyed by color alone'
                    });
                }

                // Check for focus management
                const focusRegex = /\.focus\(\)|autoFocus|tabIndex/gi;
                if (focusRegex.test(content)) {
                    recommendations.push({
                        file: itemPath,
                        type: 'focus-management',
                        severity: 'info',
                        message: 'Review focus management implementation for accessibility'
                    });
                }
            }
        });
    };

    searchDirectory(directory);

    return {
        accessibilityIssues,
        recommendations,
        summary: {
            totalIssues: accessibilityIssues.length,
            errorCount: accessibilityIssues.filter(issue => issue.severity === 'error').length,
            warningCount: accessibilityIssues.filter(issue => issue.severity === 'warning').length,
            infoCount: accessibilityIssues.filter(issue => issue.severity === 'info').length,
            recommendationCount: recommendations.length,
            isCompliant: accessibilityIssues.filter(issue => issue.severity === 'error').length === 0
        }
    };
};

/**
 * Perform visual regression testing preparation
 * @param {string} directory - Directory to analyze
 * @returns {Promise<Object>} Visual testing preparation results
 */
export const prepareVisualTesting = async (directory) => {
    const componentFiles = [];
    const testableComponents = [];
    const missingTests = [];

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Check if file exports a React component
                const exportRegex = /export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g;
                let match;

                while ((match = exportRegex.exec(content)) !== null) {
                    const componentName = match[1];

                    // Check if it's a React component (starts with capital letter)
                    if (componentName[0] === componentName[0].toUpperCase()) {
                        componentFiles.push({
                            file: itemPath,
                            component: componentName,
                            isUnified: componentName.startsWith('Unified')
                        });

                        // Check if component is testable (has props, variants, etc.)
                        const hasProps = content.includes('props') || content.includes('interface') || content.includes('PropTypes');
                        const hasVariants = content.includes('variant') || content.includes('size') || content.includes('color');

                        if (hasProps || hasVariants) {
                            testableComponents.push({
                                file: itemPath,
                                component: componentName,
                                hasProps,
                                hasVariants,
                                isUnified: componentName.startsWith('Unified')
                            });

                            // Check if test file exists
                            const testExtensions = ['.test.js', '.test.jsx', '.test.ts', '.test.tsx', '.spec.js', '.spec.jsx', '.spec.ts', '.spec.tsx'];
                            const hasTest = testExtensions.some(ext => {
                                const testPath = itemPath.replace(/\.(js|jsx|ts|tsx)$/, ext);
                                return fs.existsSync(testPath);
                            });

                            if (!hasTest) {
                                missingTests.push({
                                    file: itemPath,
                                    component: componentName,
                                    suggestedTestPath: itemPath.replace(/\.(js|jsx|ts|tsx)$/, '.test.$1')
                                });
                            }
                        }
                    }
                }
            }
        });
    };

    searchDirectory(directory);

    return {
        componentFiles,
        testableComponents,
        missingTests,
        summary: {
            totalComponents: componentFiles.length,
            unifiedComponents: componentFiles.filter(c => c.isUnified).length,
            testableComponents: testableComponents.length,
            missingTests: missingTests.length,
            testCoverage: testableComponents.length > 0 ?
                ((testableComponents.length - missingTests.length) / testableComponents.length * 100).toFixed(1) + '%' : '0%'
        }
    };
};

/**
 * Generate comprehensive migration validation report
 * @param {string} directory - Directory to validate
 * @returns {Promise<Object>} Complete validation report
 */
export const generateValidationReport = async (directory) => {
    const brokenReferences = await checkBrokenReferences(directory);
    const accessibility = await validateAccessibility(directory);
    const visualTesting = await prepareVisualTesting(directory);

    const overallScore = calculateMigrationScore({
        brokenReferences,
        accessibility,
        visualTesting
    });

    return {
        timestamp: new Date().toISOString(),
        directory,
        overallScore,
        brokenReferences,
        accessibility,
        visualTesting,
        recommendations: generateRecommendations({
            brokenReferences,
            accessibility,
            visualTesting
        }),
        nextSteps: generateNextSteps({
            brokenReferences,
            accessibility,
            visualTesting
        })
    };
};

/**
 * Calculate migration completion score
 * @param {Object} validationResults - All validation results
 * @returns {Object} Migration score breakdown
 */
const calculateMigrationScore = ({ brokenReferences, accessibility, visualTesting }) => {
    const scores = {
        references: brokenReferences.summary.isValid ? 100 : 0,
        accessibility: accessibility.summary.isCompliant ? 100 :
            Math.max(0, 100 - (accessibility.summary.errorCount * 10) - (accessibility.summary.warningCount * 5)),
        testing: visualTesting.summary.missingTests.length === 0 ? 100 :
            Math.max(0, 100 - (visualTesting.summary.missingTests.length * 5))
    };

    const overall = Math.round((scores.references + scores.accessibility + scores.testing) / 3);

    return {
        overall,
        breakdown: scores,
        grade: overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F'
    };
};

/**
 * Generate recommendations based on validation results
 */
const generateRecommendations = ({ brokenReferences, accessibility, visualTesting }) => {
    const recommendations = [];

    if (!brokenReferences.summary.isValid) {
        recommendations.push({
            priority: 'high',
            category: 'references',
            message: 'Fix broken imports and component references before proceeding',
            action: 'Run import cleanup and verify all component paths'
        });
    }

    if (!accessibility.summary.isCompliant) {
        recommendations.push({
            priority: 'high',
            category: 'accessibility',
            message: `Fix ${accessibility.summary.errorCount} accessibility errors`,
            action: 'Add missing alt attributes, labels, and ARIA attributes'
        });
    }

    if (visualTesting.summary.missingTests.length > 0) {
        recommendations.push({
            priority: 'medium',
            category: 'testing',
            message: `Add tests for ${visualTesting.summary.missingTests.length} components`,
            action: 'Create visual regression tests for unified components'
        });
    }

    return recommendations;
};

/**
 * Generate next steps based on validation results
 */
const generateNextSteps = ({ brokenReferences, accessibility, visualTesting }) => {
    const steps = [];

    if (brokenReferences.summary.totalBrokenImports > 0) {
        steps.push('1. Fix broken import references');
    }

    if (brokenReferences.summary.totalBrokenComponents > 0) {
        steps.push('2. Resolve undefined component usage');
    }

    if (accessibility.summary.errorCount > 0) {
        steps.push('3. Fix accessibility errors');
    }

    if (visualTesting.summary.missingTests.length > 0) {
        steps.push('4. Add missing component tests');
    }

    if (steps.length === 0) {
        steps.push('✅ Migration validation complete - no issues found!');
    }

    return steps;
};

export default {
    checkBrokenReferences,
    validateAccessibility,
    prepareVisualTesting,
    generateValidationReport
};