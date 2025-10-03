#!/usr/bin/env node

/**
 * Migration validation script
 * Validates migration completeness and accessibility compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateValidationReport } from '../src/migration/migrationValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
    srcDirectory: path.join(__dirname, '../src'),
    verbose: process.argv.includes('--verbose'),
    outputFormat: process.argv.includes('--json') ? 'json' : 'console',
    saveReport: process.argv.includes('--save-report')
};

/**
 * Log message with formatting
 */
const log = (message, level = 'info') => {
    if (config.outputFormat === 'json') return;

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
 * Format validation results for console output
 */
const formatConsoleOutput = (report) => {
    log('🔍 Migration Validation Report');
    log('================================\n');

    // Overall Score
    const { overall, grade, breakdown } = report.overallScore;
    log(`📊 Overall Score: ${overall}/100 (Grade: ${grade})`);
    log(`   References: ${breakdown.references}/100`);
    log(`   Accessibility: ${breakdown.accessibility}/100`);
    log(`   Testing: ${breakdown.testing}/100\n`);

    // Broken References
    if (report.brokenReferences.summary.totalBrokenImports > 0 ||
        report.brokenReferences.summary.totalBrokenComponents > 0) {
        log('❌ Broken References Found:', 'error');

        if (report.brokenReferences.brokenImports.length > 0) {
            log(`   ${report.brokenReferences.brokenImports.length} broken imports:`);
            report.brokenReferences.brokenImports.forEach(item => {
                log(`     - ${path.relative(config.srcDirectory, item.file)}:${item.line} -> ${item.importPath}`);
            });
        }

        if (report.brokenReferences.brokenComponents.length > 0) {
            log(`   ${report.brokenReferences.brokenComponents.length} undefined components:`);
            report.brokenReferences.brokenComponents.forEach(item => {
                log(`     - ${path.relative(config.srcDirectory, item.file)}:${item.line} -> ${item.component}`);
            });
        }
        log('');
    } else {
        log('✅ No broken references found', 'success');
    }

    // Accessibility Issues
    if (report.accessibility.summary.totalIssues > 0) {
        log(`⚠️  Accessibility Issues Found: ${report.accessibility.summary.totalIssues}`, 'warning');
        log(`   Errors: ${report.accessibility.summary.errorCount}`);
        log(`   Warnings: ${report.accessibility.summary.warningCount}`);

        if (config.verbose && report.accessibility.accessibilityIssues.length > 0) {
            log('\n   Details:');
            report.accessibility.accessibilityIssues.slice(0, 10).forEach(issue => {
                log(`     - ${path.relative(config.srcDirectory, issue.file)}:${issue.line} [${issue.severity}] ${issue.message}`);
            });

            if (report.accessibility.accessibilityIssues.length > 10) {
                log(`     ... and ${report.accessibility.accessibilityIssues.length - 10} more issues`);
            }
        }
        log('');
    } else {
        log('✅ No accessibility issues found', 'success');
    }

    // Visual Testing
    log(`📊 Component Testing Status:`);
    log(`   Total Components: ${report.visualTesting.summary.totalComponents}`);
    log(`   Unified Components: ${report.visualTesting.summary.unifiedComponents}`);
    log(`   Test Coverage: ${report.visualTesting.summary.testCoverage}`);

    if (report.visualTesting.summary.missingTests.length > 0) {
        log(`   Missing Tests: ${report.visualTesting.summary.missingTests.length}`, 'warning');

        if (config.verbose) {
            log('\n   Components without tests:');
            report.visualTesting.missingTests.slice(0, 10).forEach(test => {
                log(`     - ${test.component} (${path.relative(config.srcDirectory, test.file)})`);
            });

            if (report.visualTesting.missingTests.length > 10) {
                log(`     ... and ${report.visualTesting.missingTests.length - 10} more components`);
            }
        }
    }
    log('');

    // Recommendations
    if (report.recommendations.length > 0) {
        log('💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
            const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            log(`   ${index + 1}. ${priority} ${rec.message}`);
            log(`      Action: ${rec.action}`);
        });
        log('');
    }

    // Next Steps
    if (report.nextSteps.length > 0) {
        log('🚀 Next Steps:');
        report.nextSteps.forEach(step => {
            log(`   ${step}`);
        });
    }
};

/**
 * Main validation process
 */
async function runValidation() {
    try {
        log('🚀 Starting migration validation...');

        const report = await generateValidationReport(config.srcDirectory);

        if (config.outputFormat === 'json') {
            console.log(JSON.stringify(report, null, 2));
        } else {
            formatConsoleOutput(report);
        }

        // Save report if requested
        if (config.saveReport) {
            const reportPath = path.join(__dirname, '../validation-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            log(`📄 Validation report saved to: ${reportPath}`);
        }

        // Exit with appropriate code
        const hasErrors = !report.brokenReferences.summary.isValid ||
            !report.accessibility.summary.isCompliant;

        if (hasErrors) {
            log('\n❌ Validation failed - please address the issues above', 'error');
            process.exit(1);
        } else {
            log('\n✅ Migration validation passed!', 'success');
            process.exit(0);
        }

    } catch (error) {
        log(`Error during validation: ${error.message}`, 'error');
        if (config.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

/**
 * Display help information
 */
function showHelp() {
    console.log(`
Migration Validation Script

Usage: node validate-migration.js [options]

Options:
  --verbose      Show detailed output including individual issues
  --json         Output results in JSON format
  --save-report  Save validation report to file
  --help         Show this help message

Examples:
  node validate-migration.js --verbose
  node validate-migration.js --json --save-report
  node validate-migration.js --verbose --save-report
`);
}

// Main execution
if (process.argv.includes('--help')) {
    showHelp();
    process.exit(0);
}

runValidation().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
});