// src/utils/cognito-helpers.js
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import appConfig from '../services/config.js';

// Use the centralized configuration from config.js
const poolData = {
  UserPoolId: appConfig.COGNITO.USER_POOL_ID,
  ClientId: appConfig.COGNITO.APP_CLIENT_ID,
};

// Log configuration for debugging
console.log('Cognito configuration:', {
  UserPoolId: poolData.UserPoolId ? "✓ Set" : "✗ Missing", 
  ClientId: poolData.ClientId ? "✓ Set" : "✗ Missing",
  Region: appConfig.COGNITO.REGION
});

// Validate the pool data
if (!poolData.UserPoolId || !poolData.ClientId) {
  console.error('Missing Cognito credentials in configuration (utils/cognito-helpers.js)');
  console.error('Environment variables available:', import.meta.env);
}

// Create a new user pool instance
const userPool = new CognitoUserPool(poolData);

/**
 * Sign in a user using Cognito
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} The signed-in user and tokens
 */
export const cognitoSignIn = (username, password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: username, Password: password });
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve({
          user,
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        reject({
          message: 'NEW_PASSWORD_REQUIRED',
          userAttributes,
          requiredAttributes
        });
      }
    });
  });
};

/**
 * Sign out the current user
 */
export const cognitoSignOut = () => {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
};

/**
 * Get the current user's Cognito session
 * @returns {Promise<Object|null>} The Cognito session or null if not authenticated
 */
export const getCognitoSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      return resolve(null);
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        console.error("Error getting session:", err);
        return reject(err);
      }
      resolve(session);
    });
  });
};

/**
 * Get the current user's JWT token
 * @returns {Promise<string|null>} The JWT token or null if not authenticated
 */
export const getAuthToken = async () => {
  try {
    const session = await getCognitoSession();
    return session ? session.getIdToken().getJwtToken() : null;
  } catch (error) {
    return null;
  }
};

/**
 * Parse a JWT token and extract the payload
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Check if the current user has a specific role
 * @param {string} requiredRole - The role to check for
 * @returns {Promise<boolean>} True if the user has the role, false otherwise
 */
export const hasRole = async (requiredRole) => {
  try {
    const token = await getAuthToken();
    if (!token) return false;
    
    const payload = parseJwt(token);
    if (!payload) return false;
    
    // Check the 'custom:role' claim in the token
    const userRole = payload['custom:role']?.toLowerCase() || '';
    return userRole === requiredRole.toLowerCase();
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Get the expiration time of the current JWT token
 * @returns {Promise<Date|null>} The expiration date or null if not authenticated
 */
export const getTokenExpiration = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return null;
    
    // The 'exp' claim is in seconds since epoch
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Check if the current JWT token is expired or about to expire
 * @param {number} bufferSeconds - Buffer time in seconds before actual expiration
 * @returns {Promise<boolean>} True if the token is expired or about to expire
 */
export const isTokenExpired = async (bufferSeconds = 300) => {
  try {
    const expiration = await getTokenExpiration();
    if (!expiration) return true;
    
    // Check if the token is expired or will expire within the buffer time
    const now = new Date();
    const bufferTime = new Date(now.getTime() + bufferSeconds * 1000);
    
    return expiration < bufferTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get the Cognito user's attributes
 * @returns {Promise<Object>} The user attributes
 */
export const getCognitoUserAttributes = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      return reject(new Error("No current user"));
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        return reject(err || new Error("Invalid session"));
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          return reject(err);
        }
        
        // Convert array of attributes to an object
        const userAttributes = {};
        attributes.forEach(attr => {
          userAttributes[attr.getName()] = attr.getValue();
        });
        
        resolve(userAttributes);
      });
    });
  });
};

/**
 * Get the Cognito user's information from token and attributes
 * @returns {Promise<Object>} User information
 */
export const getCognitoUserInfo = async () => {
  try {
    const attributes = await getCognitoUserAttributes();
    const session = await getCognitoSession();
    
    // Extract user info from ID token claims
    const idToken = session.getIdToken();
    const payload = idToken.decodePayload();
    
    // Combine info from token and attributes
    return {
      id: payload.sub,
      username: attributes.preferred_username || payload['cognito:username'],
      email: attributes.email,
      firstName: attributes.given_name,
      lastName: attributes.family_name,
      phone: attributes.phone_number,
      role: attributes['custom:role'] || 'user',
      profileImage: attributes['custom:profile_image'] || null,
      // Add other fields as needed
    };
  } catch (error) {
    console.error("Error getting user info:", error);
    throw error;
  }
};

/**
 * Register a new user with Cognito
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} email - Email address
 * @param {Object} attributes - Additional user attributes
 * @returns {Promise<Object>} Registration result
 */
export const cognitoSignUp = (username, password, email, attributes = {}) => {
  return new Promise((resolve, reject) => {
    // Prepare the attributes array for Cognito
    const attributeList = [];
    
    // Add email as standard attribute
    attributeList.push(
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      })
    );
    
    // Add other attributes
    for (const key in attributes) {
      if (attributes[key]) {
        let value = attributes[key];
        
        // Format phone number if the attribute is phone_number
        if (key === 'phone_number' && value) {
          value = formatPhoneNumber(value);
        }
        
        attributeList.push(
          new CognitoUserAttribute({
            Name: key,
            Value: value
          })
        );
      }
    }
    
    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ user: result.user, userConfirmed: result.userConfirmed });
    });
  });
};

/**
 * Confirm a new user registration with verification code
 * @param {string} username - Username
 * @param {string} confirmationCode - Verification code
 * @returns {Promise<void>}
 */
export const cognitoConfirmSignUp = (username, confirmationCode) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Initiate forgot password flow
 * @param {string} username - Username
 * @returns {Promise<void>}
 */
export const cognitoForgotPassword = (username) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve(data);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * Complete the forgot password flow with verification code and new password
 * @param {string} username - Username
 * @param {string} verificationCode - Verification code
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const cognitoForgotPasswordSubmit = (username, verificationCode, newPassword) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * Change password for authenticated user
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const cognitoChangePassword = (oldPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return reject(new Error("No authenticated user"));
    }
    
    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        return reject(err || new Error("Invalid session"));
      }
      
      cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
};

/**
 * Format a phone number to E.164 international format required by Cognito
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  let digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if it already starts with a '+' and has digits
  if (phoneNumber.startsWith('+') && digitsOnly.length > 0) {
    return '+' + digitsOnly;
  }
  
  // For US/Canada numbers (default if no country code)
  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  }
  
  // If the number already has a country code (11+ digits)
  if (digitsOnly.length > 10) {
    // If it doesn't start with '1' (US/Canada), assume it has a proper country code
    return '+' + digitsOnly;
  }
  
  // For incomplete numbers, still format but these will likely fail validation
  return '+' + digitsOnly;
};

/**
 * Update user attributes in Cognito
 * @param {string} username - The username of the user to update
 * @param {Object} attributes - User attributes to update
 * @returns {Promise<Object>} Update result
 */
export const updateUserAttributes = (username, attributes) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    // Convert object attributes to CognitoUserAttribute array
    const attributeList = [];
    for (const key in attributes) {
      if (attributes[key] !== undefined) {
        let value = attributes[key];
        
        // Format phone number if the attribute is phone_number
        if (key === 'phone_number' && value) {
          value = formatPhoneNumber(value);
        }
        
        attributeList.push(
          new CognitoUserAttribute({
            Name: key,
            Value: value
          })
        );
      }
    }
    
    cognitoUser.getSession((err, session) => {
      if (err || !session) {
        return reject(err || new Error('No valid session'));
      }
      
      cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
};