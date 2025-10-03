/**
 * Component migration utilities for automated import replacement
 * Handles bulk component updates and import transformations
 */

import fs from 'fs';
import path from 'path';
import { getMigrationMapping, getLegacyComponentNames } from './migrationMappings';

/**
 * Replace legacy component imports in a file
 * @param {string} filePath - Path to the file to update
 * @param {string} fileContent - Content of the file
 * @returns {Object} Updated content and migration report
 */
export const replaceImports = (filePath, fileContent) => {
    let updatedContent = fileContent;
    const migrations = [];
    const warnings = [];

    // Track import replacements
    const importReplacements = new Map();

    // Find and replace import statements
    const importRegex = /import\s+(?:{([^}]+)}|([^,\s]+)(?:,\s*{([^}]+)})?)\s+from\s+['"]([^'"]+)['"]/g;

    updatedContent = updatedContent.replace(importRegex, (match, namedImports, defaultImport, additionalNamed, importPath) => {
        let hasChanges = false;
        let newImports = [];
        let newImportPaths = new Set();

        // Handle named imports
        if (namedImports) {
            const imports = namedImports.split(',').map(imp => imp.trim());
            const updatedImports = [];

            imports.forEach(importName => {
                const mapping = getMigrationMapping(importName);
                if (mapping) {
                    hasChanges = true;
                    newImportPaths.add(mapping.importPath);
                    importReplacements.set(importName, mapping.unifiedComponent);
                    migrations.push({
                        type: 'import',
                        legacy: importName,
                        unified: mapping.unifiedComponent,
                        importPath: mapping.importPath
                    });
                } else {
                    updatedImports.push(importName);
                }
            });

            if (updatedImports.length > 0) {
                newImports.push(`{ ${updatedImports.join(', ')} }`);
            }
        }

        // Handle default import
        if (defaultImport) {
            const mapping = getMigrationMapping(defaultImport);
            if (mapping) {
                hasChanges = true;
                newImportPaths.add(mapping.importPath);
                importReplacements.set(defaultImport, mapping.unifiedComponent);
                migrations.push({
                    type: 'import',
                    legacy: defaultImport,
                    unified: mapping.unifiedComponent,
                    importPath: mapping.importPath
                });
            } else {
                newImports.push(defaultImport);
            }
        }

        // Handle additional named imports
        if (additionalNamed) {
            const imports = additionalNamed.split(',').map(imp => imp.trim());
            const updatedImports = [];

            imports.forEach(importName => {
                const mapping = getMigrationMapping(importName);
                if (mapping) {
                    hasChanges = true;
                    newImportPaths.add(mapping.importPath);
                    importReplacements.set(importName, mapping.unifiedComponent);
                    migrations.push({
                        type: 'import',
                        legacy: importName,
                        unified: mapping.unifiedComponent,
                        importPath: mapping.importPath
                    });
                } else {
                    updatedImports.push(importName);
                }
            });

            if (updatedImports.length > 0) {
                if (newImports.length > 0) {
                    newImports[newImports.length - 1] = newImports[newImports.length - 1].replace('}', `, ${updatedImports.join(', ')}`);
                } else {
                    newImports.push(`{ ${updatedImports.join(', ')} }`);
                }
            }
        }

        if (hasChanges) {
            // Generate new import statements
            let result = '';

            // Keep original import if there are remaining imports
            if (newImports.length > 0) {
                result += `import ${newImports.join(', ')} from '${importPath}';\n`;
            }

            // Add new imports for unified components
            newImportPaths.forEach(newPath => {
                const unifiedComponents = [];
                importReplacements.forEach((unified, legacy) => {
                    const mapping = getMigrationMapping(legacy);
                    if (mapping && mapping.importPath === newPath) {
                        unifiedComponents.push(unified);
                    }
                });

                if (unifiedComponents.length > 0) {
                    result += `import { ${unifiedComponents.join(', ')} } from '${newPath}';`;
                }
            });

            return result;
        }

        return match;
    });

    // Replace component usage in JSX
    importReplacements.forEach((unifiedComponent, legacyComponent) => {
        const componentRegex = new RegExp(`<${legacyComponent}([^>]*)>`, 'g');
        const selfClosingRegex = new RegExp(`<${legacyComponent}([^>]*)\/>`, 'g');

        updatedContent = updatedContent.replace(componentRegex, `<${unifiedComponent}$1>`);
        updatedContent = updatedContent.replace(selfClosingRegex, `<${unifiedComponent}$1/>`);
        updatedContent = updatedContent.replace(new RegExp(`</${legacyComponent}>`, 'g'), `</${unifiedComponent}>`);

        migrations.push({
            type: 'component',
            legacy: legacyComponent,
            unified: unifiedComponent
        });
    });

    return {
        content: updatedContent,
        migrations,
        warnings,
        hasChanges: migrations.length > 0
    };
};

/**
 * Process a single file for component migration
 * @param {string} filePath - Path to the file to process
 * @returns {Promise<Object>} Migration result
 */
export const migrateFile = async (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = replaceImports(filePath, fileContent);

        if (result.hasChanges) {
            // Create backup
            const backupPath = `${filePath}.backup`;
            fs.writeFileSync(backupPath, fileContent);

            // Write updated content
            fs.writeFileSync(filePath, result.content);

            return {
                success: true,
                filePath,
                backupPath,
                migrations: result.migrations,
                warnings: result.warnings
            };
        }

        return {
            success: true,
            filePath,
            migrations: [],
            warnings: [],
            message: 'No changes needed'
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
 * Process multiple files for component migration
 * @param {string[]} filePaths - Array of file paths to process
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} Bulk migration result
 */
export const migrateFiles = async (filePaths, options = {}) => {
    const { dryRun = false, createBackups = true } = options;
    const results = [];
    const summary = {
        totalFiles: filePaths.length,
        migratedFiles: 0,
        errors: 0,
        totalMigrations: 0
    };

    for (const filePath of filePaths) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const migrationResult = replaceImports(filePath, fileContent);

            if (migrationResult.hasChanges) {
                if (!dryRun) {
                    if (createBackups) {
                        const backupPath = `${filePath}.backup`;
                        fs.writeFileSync(backupPath, fileContent);
                    }
                    fs.writeFileSync(filePath, migrationResult.content);
                }

                summary.migratedFiles++;
                summary.totalMigrations += migrationResult.migrations.length;
            }

            results.push({
                success: true,
                filePath,
                migrations: migrationResult.migrations,
                warnings: migrationResult.warnings,
                dryRun
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
 * Find files that need migration
 * @param {string} directory - Directory to search
 * @param {Object} options - Search options
 * @returns {Promise<string[]>} Array of file paths that need migration
 */
export const findFilesNeedingMigration = async (directory, options = {}) => {
    const { extensions = ['.js', '.jsx', '.ts', '.tsx'], exclude = ['node_modules', '.git', 'dist', 'build'] } = options;
    const legacyComponents = getLegacyComponentNames();
    const filesToMigrate = [];

    const searchDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !exclude.includes(item)) {
                searchDirectory(itemPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                const content = fs.readFileSync(itemPath, 'utf8');

                // Check if file contains legacy component imports or usage
                const hasLegacyComponents = legacyComponents.some(component => {
                    const importRegex = new RegExp(`import.*${component}.*from`, 'i');
                    const usageRegex = new RegExp(`<${component}[^>]*>`, 'i');
                    return importRegex.test(content) || usageRegex.test(content);
                });

                if (hasLegacyComponents) {
                    filesToMigrate.push(itemPath);
                }
            }
        });
    };

    searchDirectory(directory);
    return filesToMigrate;
};

/**
 * Generate migration report for a directory
 * @param {string} directory - Directory to analyze
 * @returns {Promise<Object>} Migration analysis report
 */
export const generateMigrationReport = async (directory) => {
    const filesToMigrate = await findFilesNeedingMigration(directory);
    const legacyComponents = getLegacyComponentNames();
    const componentUsage = {};

    // Initialize component usage tracking
    legacyComponents.forEach(component => {
        componentUsage[component] = {
            files: [],
            count: 0
        };
    });

    // Analyze each file
    filesToMigrate.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');

        legacyComponents.forEach(component => {
            const importRegex = new RegExp(`import.*${component}.*from`, 'gi');
            const usageRegex = new RegExp(`<${component}[^>]*>`, 'gi');

            const importMatches = content.match(importRegex) || [];
            const usageMatches = content.match(usageRegex) || [];

            if (importMatches.length > 0 || usageMatches.length > 0) {
                componentUsage[component].files.push(filePath);
                componentUsage[component].count += importMatches.length + usageMatches.length;
            }
        });
    });

    return {
        totalFiles: filesToMigrate.length,
        filesToMigrate,
        componentUsage,
        estimatedMigrations: Object.values(componentUsage).reduce((sum, usage) => sum + usage.count, 0)
    };
};

export default {
    replaceImports,
    migrateFile,
    migrateFiles,
    findFilesNeedingMigration,
    generateMigrationReport
};