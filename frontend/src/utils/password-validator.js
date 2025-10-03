// src/utils/password-validator.js

/**
 * Validates a password against AWS Cognito requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with success flag and error message
 */
export const validatePassword = (password) => {
  // Cognito default password policy:
  // - Minimum length of 8 characters
  // - Contains at least 1 number
  // - Contains at least 1 special character
  // - Contains at least 1 uppercase letter
  // - Contains at least 1 lowercase letter
  
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    isValid: true,
    message: 'Password meets all requirements'
  };
};

/**
 * Checks if passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} - True if passwords match
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Gets password strength score (0-4)
 * @param {string} password - The password to evaluate
 * @returns {number} - Score from 0 (weakest) to 4 (strongest)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[0-9]/.test(password)) score += 0.5;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[a-z]/.test(password)) score += 0.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 0.5;
  
  // Variety check
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;
  
  return Math.min(4, Math.floor(score));
};

/**
 * Gets a descriptive label for password strength
 * @param {number} strength - Password strength score (0-4)
 * @returns {string} - Descriptive label
 */
export const getPasswordStrengthLabel = (strength) => {
  switch (strength) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    default: return 'Unknown';
  }
};

/**
 * Gets a theme color name for password strength visualization
 * @param {number} strength - Password strength score (0-4)
 * @returns {string} - Theme color name
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0: return 'error.main'; // red
    case 1: return 'warning.main'; // orange
    case 2: return 'warning.light'; // yellow
    case 3: return 'success.main'; // green
    case 4: return 'success.dark'; // dark green
    default: return 'grey.400'; // grey
  }
};