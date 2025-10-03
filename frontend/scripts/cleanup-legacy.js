#!/usr/bin/env node

/**
 * Legacy component cleanup script
 * Systematically removes deprecated components and unused styles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    findLegacyComponents,
    findUnusedStyles,
    updateImportReferences,
    removeLegacyFiles,
    generateCleanupReport
} from '../src/migration/legacyCleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
    srcDirectory: path.join(__dirname, '../src'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    createBackups: !process.argv.includes('--no-backup'),
    interactive: process.argv.includes('--interactive')
};

/**
 * Log message with optional verbose mode
 */
const log = (message, level = 'info') => {
    if (level === 'verbose' && !config.verbose) return;

    const prefix = {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        verbose: '🔍'
    }[level] || '📋';

    console.log(`${prefix} ${message}`);
};

/**
 * Prompt user for confirmation
 */
const confirm = async (message) => {
    if (!config.interactive) return true;

    const readline = await import('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${message} (y/N): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
};

/**
 * Main cleanup process
 */
async function runCleanup() {
    log('🚀 Starting legacy component cleanup process...');

    if (config.dryRun) {
        log('Running in DRY RUN mode - no files will be modified', 'warning');
    }

    try {
        // Step 1: Generate comprehensive report
        log('📊 Generating cleanup report...');
        const report = await generateCleanupReport(config.srcDirectory);

        log(`Found ${report.legacyComponents.summary.totalLegacyFiles} legacy component files`, 'verbose');
        log(`Found ${report.legacyComponents.summary.totalLegacyImports} legacy imports`, 'verbose');
        log(`Found ${report.legacyComponents.summary.totalLegacyUsage} legacy component usages`, 'verbose');
        log(`Found ${report.unusedStyles.summary.unusedStyles} unused styles`, 'verbose');

        // Save report
        const reportPath = path.join(__dirname, '../migration-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        log(`📄 Cleanup report saved to: ${reportPath}`);

        // Step 2: Update import references
        if (report.legacyComponents.legacyImports.length > 0) {
            log(`\n🔄 Updating ${report.legacyComponents.legacyImports.length} import references...`);

            if (config.interactive) {
                const proceed = await confirm('Update import references?');
                if (!proceed) {
                    log('Skipping import updates', 'warning');
                } else {
                    await updateImports(report.legacyComponents.legacyImports);
                }
            } else {
                await updateImports(report.legacyComponents.legacyImports);
            }
        }

        // Step 3: Remove unused legacy files
        if (report.legacyComponents.unusedFiles.length > 0) {
            log(`\n🗑️  Removing ${report.legacyComponents.unusedFiles.length} unused legacy files...`);

            if (config.interactive) {
                log('Files to be removed:');
                report.legacyComponents.unusedFiles.forEach(file => {
                    log(`  - ${file.path}`, 'verbose');
                });

                const proceed = await confirm('Remove these files?');
                if (!proceed) {
                    log('Skipping file removal', 'warning');
                } else {
                    await removeFiles(report.legacyComponents.unusedFiles.map(f => f.path));
                }
            } else {
                await removeFiles(report.legacyComponents.unusedFiles.map(f => f.path));
            }
        }

        // Step 4: Clean up unused styles
        if (report.unusedStyles.unusedStyles.length > 0) {
            log(`\n🎨 Found ${report.unusedStyles.unusedStyles.length} unused styles`);
            log('Manual review recommended for style cleanup', 'warning');

            // Save unused styles report
            const stylesReportPath = path.join(__dirname, '../unused-styles-report.json');
            fs.writeFileSync(stylesReportPath, JSON.stringify(report.unusedStyles, null, 2));
            log(`📄 Unused styles report saved to: ${stylesReportPath}`);
        }

        // Step 5: Summary
        log('\n📋 Cleanup Summary:');
        log(`  Legacy files processed: ${report.legacyComponents.summary.totalLegacyFiles}`);
        log(`  Import references updated: ${report.legacyComponents.legacyImports.length}`);
        log(`  Unused files removed: ${report.legacyComponents.unusedFiles.length}`);
        log(`  Unused styles identified: ${report.unusedStyles.summary.unusedStyles}`);

        if (config.dryRun) {
            log('\n⚠️  This was a DRY RUN - no files were actually modified');
            log('Run without --dry-run to apply changes');
        } else {
            log('\n✅ Legacy cleanup completed successfully!');
        }

    } catch (error) {
        log(`Error during cleanup: ${error.message}`, 'error');
        process.exit(1);
    }
}

/**
 * Update import references
 */
async function updateImports(legacyImports) {
    const uniqueFiles = [...new Set(legacyImports.map(imp => imp.file))];
    let successCount = 0;
    let errorCount = 0;

    for (const filePath of uniqueFiles) {
        try {
            const result = await updateImportReferences(filePath);

            if (result.success && result.hasChanges) {
                successCount++;
                log(`Updated imports in: ${path.relative(config.srcDirectory, filePath)}`, 'verbose');
            }
        } catch (error) {
            errorCount++;
            log(`Failed to update ${filePath}: ${error.message}`, 'error');
        }
    }

    log(`✅ Updated imports in ${successCount} files`);
    if (errorCount > 0) {
        log(`❌ Failed to update ${errorCount} files`, 'error');
    }
}

/**
 * Remove legacy files
 */
async function removeFiles(filePaths) {
    const result = await removeLegacyFiles(filePaths, {
        dryRun: config.dryRun,
        createBackups: config.createBackups
    });

    log(`✅ ${config.dryRun ? 'Would remove' : 'Removed'} ${result.summary.removedFiles} files`);

    if (result.summary.errors > 0) {
        log(`❌ Failed to remove ${result.summary.errors} files`, 'error');
        result.results.forEach(r => {
            if (!r.success) {
                log(`  - ${r.filePath}: ${r.error}`, 'error');
            }
        });
    }
}

/**
 * Display help information
 */
function showHelp() {
    console.log(`
Legacy Component Cleanup Script

Usage: node cleanup-legacy.js [options]

Options:
  --dry-run      Run without making any changes (preview mode)
  --verbose      Show detailed output
  --no-backup    Don't create backup files
  --interactive  Prompt for confirmation before each step
  --help         Show this help message

Examples:
  node cleanup-legacy.js --dry-run --verbose
  node cleanup-legacy.js --interactive
  node cleanup-legacy.js --no-backup
`);
}

// Main execution
if (process.argv.includes('--help')) {
    showHelp();
    process.exit(0);
}

runCleanup().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
});