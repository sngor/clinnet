/**
 * Helper utilities for transforming user data between backend and frontend
 */

/**
 * Transform Cognito user attributes into a consistent user object for frontend
 * 
 * @param {Object} user - User from Cognito or backend API
 * @returns {Object} Transformed user with consistent properties
 */
export const transformUserForFrontend = (user) => {
  const transformedUser = { ...user };
  
  // Ensure profile image is available in standard properties
  if (user.custom_profile_image && !user.profileImage) {
    transformedUser.profileImage = user.custom_profile_image;
    transformedUser.avatar = user.custom_profile_image;
  }
  
  // Handle array of attributes (from Cognito)
  if (user.Attributes && Array.isArray(user.Attributes)) {
    user.Attributes.forEach(attr => {
      if (attr.Name === 'custom:profile_image') {
        transformedUser.profileImage = attr.Value;
        transformedUser.avatar = attr.Value;
      }
    });
  }
  
  // Handle UserAttributes format (from AdminGetUser)
  if (user.UserAttributes && Array.isArray(user.UserAttributes)) {
    user.UserAttributes.forEach(attr => {
      if (attr.Name === 'custom:profile_image') {
        transformedUser.profileImage = attr.Value;
        transformedUser.avatar = attr.Value;
      }
    });
  }
  
  return transformedUser;
};

/**
 * Transform an array of users to ensure they all have consistent profile image properties
 */
export const transformUsersForFrontend = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(transformUserForFrontend);
};
