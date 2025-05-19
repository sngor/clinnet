// src/utils/cognito-helpers.js
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_USER_POOL_ID,
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
};
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
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) return reject(err || new Error('Invalid session'));
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
 * Get user attributes from Cognito
 * @returns {Promise<Object>} User attributes as a key-value object
 */
export const getCognitoUserAttributes = () => {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) return reject(err || new Error('Invalid session'));
      user.getUserAttributes((err, attributes) => {
        if (err) return reject(err);
        const attrObj = {};
        attributes.forEach(attr => {
          attrObj[attr.getName()] = attr.getValue();
        });
        resolve(attrObj);
      });
    });
  });
};

/**
 * Parse user info (name, email, etc) from Cognito session or attributes
 * @returns {Promise<Object>} User info object
 */
export const getCognitoUserInfo = async () => {
  const user = userPool.getCurrentUser();
  if (!user) return null;
  const session = await getCognitoSession();
  if (!session) return null;
  const idToken = session.getIdToken().getJwtToken();
  const payload = JSON.parse(atob(idToken.split('.')[1]));
  // Try to get attributes for more up-to-date info
  let attributes = {};
  try {
    attributes = await getCognitoUserAttributes();
  } catch {}
  return {
    username: payload['cognito:username'] || attributes['preferred_username'] || '',
    email: payload.email || attributes.email || '',
    firstName: payload.given_name || attributes.given_name || '',
    lastName: payload.family_name || attributes.family_name || '',
    name: (payload.given_name || attributes.given_name || '') + ' ' + (payload.family_name || attributes.family_name || ''),
    phone: payload.phone_number || attributes.phone_number || '',
    role: payload['custom:role'] || attributes['custom:role'] || 'user',
    ...attributes
  };
};