/**
 * Helper utilities for user data transformations
 */

/**
 * Extract username from email (part before @)
 * @param {string} email - Email address 
 * @returns {string} - Username portion
 */
function extractUsernameFromEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email || '';
  }
  return email.split('@')[0];
}

/**
 * Transform user data for client consumption
 * @param {Object} user - Raw user data from Cognito
 * @returns {Object} - Transformed user data
 */
function transformUserForClient(user) {
  if (!user) return null;
  
  // Extract properties
  const {
    Username,
    Attributes = [],
    Enabled,
    UserStatus,
    UserCreateDate,
    UserLastModifiedDate,
    ...otherProps
  } = user;
  
  // Convert attributes array to object
  const attributesObj = {};
  Attributes.forEach(attr => {
    attributesObj[attr.Name] = attr.Value;
  });
  
  const email = attributesObj.email || '';
  
  // Create new user object with renamed fields
  return {
    uniqueId: Username, // Original username/sub becomes uniqueId
    username: extractUsernameFromEmail(email), // Email username becomes the displayed username
    email,
    firstName: attributesObj.given_name || '',
    lastName: attributesObj.family_name || '',
    phone: attributesObj.phone_number || '',
    role: attributesObj['custom:role'] || 'user',
    profileImage: attributesObj['custom:profileImage'] || null,
    enabled: Enabled === undefined ? true : Enabled,
    status: UserStatus || '',
    createdAt: UserCreateDate ? new Date(UserCreateDate).toISOString() : null,
    updatedAt: UserLastModifiedDate ? new Date(UserLastModifiedDate).toISOString() : null,
    // Include any other needed properties
    ...otherProps
  };
}

/**
 * Transform an array of users for client consumption
 * @param {Array} users - Array of raw user data from Cognito
 * @returns {Array} - Array of transformed user data
 */
function transformUsersForClient(users) {
  if (!Array.isArray(users)) return [];
  return users.map(transformUserForClient);
}

module.exports = {
  extractUsernameFromEmail,
  transformUserForClient,
  transformUsersForClient,
};
