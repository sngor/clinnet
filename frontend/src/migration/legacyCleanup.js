/**
 * Legacy component cleanup utilities
 * Systematically identifies and removes deprecated components and styles
 */

import fs from 'fs';
import path from 'path';
import { getLegacyComponentNames, getMigrationMapping } from './migrationMappings';

/**
 * Find all legacy component files in the project
 * @param {string} directory - Directory to search
 * @returns {Promise<Object>} Legacy component analysis
 */
export const findLegacyComponents = async (directory) => {
    const legacyFiles = [];
    const legacyImports = [];
    const legacyUsage = [];
    const unusedFiles = [];

    const legacyComponentNames = getLegacyComponentNames();

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Check if this file defines a legacy component
                const isLegacyComponentFile = legacyComponentNames.some(component => {
                    const exportRegex = new RegExp(`export.*${component}`, 'i');
                    const defaultExportRegex = new RegExp(`export\\s+default\\s+${component}`, 'i');
                    return exportRegex.test(content) || defaultExportRegex.test(content);
                });

                if (isLegacyComponentFile) {
                    legacyFiles.push({
                        path: itemPath,
                        components: legacyComponentNames.filter(component => {
                            const exportRegex = new RegExp(`export.*${component}`, 'i');
                            const defaultExportRegex = new RegExp(`export\\s+default\\s+${component}`, 'i');
                            return exportRegex.test(content) || defaultExportRegex.test(content);
                        })
                    });
                }

                // Check for legacy component imports
                legacyComponentNames.forEach(component => {
                    const importRegex = new RegExp(`import.*${component}.*from`, 'i');
                    if (importRegex.test(content)) {
                        legacyImports.push({
                            file: itemPath,
                            component,
                            line: content.split('\n').findIndex(line => importRegex.test(line)) + 1
                        });
                    }
                });

                // Check for legacy component usage
                legacyComponentNames.forEach(component => {
                    const usageRegex = new RegExp(`<${component}[^>]*>`, 'gi');
                    const matches = content.match(usageRegex) || [];
                    if (matches.length > 0) {
                        legacyUsage.push({
                            file: itemPath,
                            component,
                            count: matches.length,
                            lines: content.split('\n').map((line, index) =>
                                usageRegex.test(line) ? index + 1 : null
                            ).filter(Boolean)
                        });
                    }
                });
            }
        });
    };

    searchDirectory(directory);

    // Find unused legacy files (files that define legacy components but aren't imported anywhere)
    legacyFiles.forEach(legacyFile => {
        const isUsed = legacyImports.some(importInfo =>
            legacyFile.components.some(component =>
                importInfo.component === component
            )
        );

        if (!isUsed) {
            unusedFiles.push(legacyFile);
        }
    });

    return {
        legacyFiles,
        legacyImports,
        legacyUsage,
        unusedFiles,
        summary: {
            totalLegacyFiles: legacyFiles.length,
            totalLegacyImports: legacyImports.length,
            totalLegacyUsage: legacyUsage.reduce((sum, usage) => sum + usage.count, 0),
            unusedFiles: unusedFiles.length
        }
    };
};

/**
 * Find unused CSS and style definitions
 * @param {string} directory - Directory to search
 * @returns {Promise<Object>} Unused styles analysis
 */
export const findUnusedStyles = async (directory) => {
    const cssFiles = [];
    const styledComponents = [];
    const unusedStyles = [];
    const duplicateStyles = [];

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile()) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Find CSS files
                if (item.endsWith('.css') || item.endsWith('.scss') || item.endsWith('.less')) {
                    cssFiles.push({
                        path: itemPath,
                        content
                    });
                }

                // Find styled-components
                if (['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                    const styledRegex = /const\s+(\w+)\s*=\s*styled\./g;
                    let match;
                    while ((match = styledRegex.exec(content)) !== null) {
                        styledComponents.push({
                            file: itemPath,
                            component: match[1],
                            line: content.substring(0, match.index).split('\n').length
                        });
                    }
                }
            }
        });
    };

    searchDirectory(directory);

    // Analyze CSS for unused classes and duplicates
    const allClasses = new Set();
    const classUsage = new Map();

    cssFiles.forEach(cssFile => {
        const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;
        let match;
        while ((match = classRegex.exec(cssFile.content)) !== null) {
            const className = match[1];
            allClasses.add(className);

            if (!classUsage.has(className)) {
                classUsage.set(className, []);
            }
            classUsage.get(className).push({
                file: cssFile.path,
                line: cssFile.content.substring(0, match.index).split('\n').length
            });
        }
    });

    // Check for unused classes
    const allJSFiles = [];
    const searchForJSFiles = (dir) => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
                searchForJSFiles(itemPath);
            } else if (['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
                allJSFiles.push(itemPath);
            }
        });
    };

    searchForJSFiles(directory);

    allClasses.forEach(className => {
        let isUsed = false;

        for (const jsFile of allJSFiles) {
            const content = fs.readFileSync(jsFile, 'utf8');
            if (content.includes(className)) {
                isUsed = true;
                break;
            }
        }

        if (!isUsed) {
            unusedStyles.push({
                className,
                definitions: classUsage.get(className)
            });
        }
    });

    // Find duplicate styles
    const styleDefinitions = new Map();
    cssFiles.forEach(cssFile => {
        const ruleRegex = /([^{]+)\s*\{([^}]+)\}/g;
        let match;
        while ((match = ruleRegex.exec(cssFile.content)) !== null) {
            const selector = match[1].trim();
            const rules = match[2].trim();

            if (!styleDefinitions.has(rules)) {
                styleDefinitions.set(rules, []);
            }
            styleDefinitions.get(rules).push({
                file: cssFile.path,
                selector,
                line: cssFile.content.substring(0, match.index).split('\n').length
            });
        }
    });

    styleDefinitions.forEach((definitions, rules) => {
        if (definitions.length > 1) {
            duplicateStyles.push({
                rules,
                definitions
            });
        }
    });

    return {
        cssFiles,
        styledComponents,
        unusedStyles,
        duplicateStyles,
        summary: {
            totalCSSFiles: cssFiles.length,
            totalStyledComponents: styledComponents.length,
            unusedStyles: unusedStyles.length,
            duplicateStyles: duplicateStyles.length
        }
    };
};

/**
 * Update import references to use unified components
 * @param {string} filePath - Path to the file to update
 * @returns {Promise<Object>} Update result
 */
export const updateImportReferences = async (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        const updates = [];

        const legacyComponentNames = getLegacyComponentNames();

        legacyComponentNames.forEach(legacyComponent => {
            const mapping = getMigrationMapping(legacyComponent);
            if (!mapping) return;

            // Update import statements
            const importRegex = new RegExp(`import\\s+{([^}]*)}\\s+from\\s+['"][^'"]*${legacyComponent}[^'"]*['"]`, 'g');
            updatedContent = updatedContent.replace(importRegex, (match, imports) => {
                updates.push({
                    type: 'import',
                    legacy: legacyComponent,
                    unified: mapping.unifiedComponent,
                    original: match
                });

                const updatedImports = imports.replace(legacyComponent, mapping.unifiedComponent);
                return `import { ${updatedImports} } from '${mapping.importPath}'`;
            });

            // Update default imports
            const defaultImportRegex = new RegExp(`import\\s+${legacyComponent}\\s+from\\s+['"][^'"]*['"]`, 'g');
            updatedContent = updatedContent.replace(defaultImportRegex, (match) => {
                updates.push({
                    type: 'default-import',
                    legacy: legacyComponent,
                    unified: mapping.unifiedComponent,
                    original: match
                });

                return `import { ${mapping.unifiedComponent} } from '${mapping.importPath}'`;
            });
        });

        if (updates.length > 0) {
            // Create backup
            const backupPath = `${filePath}.cleanup.backup`;
            fs.writeFileSync(backupPath, content);

            // Write updated content
            fs.writeFileSync(filePath, updatedContent);
        }

        return {
            success: true,
            filePath,
            updates,
            hasChanges: updates.length > 0
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
 * Safely remove legacy component files
 * @param {string[]} filePaths - Array of file paths to remove
 * @param {Object} options - Removal options
 * @returns {Promise<Object>} Removal result
 */
export const removeLegacyFiles = async (filePaths, options = {}) => {
    const { dryRun = false, createBackups = true } = options;
    const results = [];
    const summary = {
        totalFiles: filePaths.length,
        removedFiles: 0,
        errors: 0
    };

    for (const filePath of filePaths) {
        try {
            if (createBackups && !dryRun) {
                const content = fs.readFileSync(filePath, 'utf8');
                const backupPath = `${filePath}.removed.backup`;
                fs.writeFileSync(backupPath, content);
            }

            if (!dryRun) {
                fs.unlinkSync(filePath);
                summary.removedFiles++;
            }

            results.push({
                success: true,
                filePath,
                action: dryRun ? 'would remove' : 'removed'
            });
        } catch (error) {
            summary.errors++;
            results.push({
                success: false,
                filePath,
                error: error.message
            });
        }
    }

    return {
        summary,
        results
    };
};

/**
 * Generate cleanup report
 * @param {string} directory - Directory to analyze
 * @returns {Promise<Object>} Comprehensive cleanup report
 */
export const generateCleanupReport = async (directory) => {
    const legacyAnalysis = await findLegacyComponents(directory);
    const styleAnalysis = await findUnusedStyles(directory);

    return {
        timestamp: new Date().toISOString(),
        directory,
        legacyComponents: legacyAnalysis,
        unusedStyles: styleAnalysis,
        recommendations: {
            filesToRemove: legacyAnalysis.unusedFiles.map(f => f.path),
            importsToUpdate: legacyAnalysis.legacyImports.map(i => i.file),
            stylesToClean: styleAnalysis.unusedStyles.length,
            duplicatesToMerge: styleAnalysis.duplicateStyles.length
        },
        estimatedCleanup: {
            files: legacyAnalysis.unusedFiles.length,
            imports: legacyAnalysis.legacyImports.length,
            usages: legacyAnalysis.legacyUsage.reduce((sum, usage) => sum + usage.count, 0),
            styles: styleAnalysis.unusedStyles.length
        }
    };
};

export default {
    findLegacyComponents,
    findUnusedStyles,
    updateImportReferences,
    removeLegacyFiles,
    generateCleanupReport
};