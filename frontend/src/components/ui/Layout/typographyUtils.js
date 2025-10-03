/**
 * Typography Utilities
 * 
 * Helper functions for enforcing semantic heading hierarchy
 * and providing consistent typography patterns.
 */

import { typographyHierarchy } from '../../../design-system/tokens/typography.js';

/**
 * Validates heading level hierarchy
 * @param {number} currentLevel - Current heading level (1-6)
 * @param {number} parentLevel - Parent heading level
 * @returns {boolean} Whether the hierarchy is valid
 */
export const validateHeadingHierarchy = (currentLevel, parentLevel) => {
    if (!parentLevel) return currentLevel === 1;
    return currentLevel <= parentLevel + 1;
};

/**
 * Gets the next logical heading level
 * @param {number} currentLevel - Current heading level
 * @returns {number} Next heading level (max 6)
 */
export const getNextHeadingLevel = (currentLevel) => {
    return Math.min(currentLevel + 1, 6);
};

/**
 * Gets typography styles for a specific variant and level
 * @param {string} variant - Typography variant
 * @param {string|number} level - Level within variant
 * @returns {Object} Typography styles
 */
export const getTypographyStyles = (variant, level) => {
    switch (variant) {
        case 'heading':
            return typographyHierarchy.heading[`h${level}`] || {};
        case 'display':
            return typographyHierarchy.display[level] || {};
        case 'body':
            return typographyHierarchy.body[level] || {};
        case 'label':
            return typographyHierarchy.label[level] || {};
        case 'caption':
            return typographyHierarchy.caption || {};
        case 'code':
            return typographyHierarchy.code[level] || {};
        default:
            return {};
    }
};

/**
 * Creates a heading hierarchy context for tracking levels
 */
export class HeadingHierarchy {
    constructor() {
        this.levels = [];
    }

    push(level) {
        this.levels.push(level);
    }

    pop() {
        return this.levels.pop();
    }

    getCurrentLevel() {
        return this.levels[this.levels.length - 1] || 0;
    }

    getNextLevel() {
        return getNextHeadingLevel(this.getCurrentLevel());
    }

    validateLevel(level) {
        return validateHeadingHierarchy(level, this.getCurrentLevel());
    }
}