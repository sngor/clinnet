const AWS = require('aws-sdk');
const { transformUsersForClient } = require('../utils/user-helpers');
const { buildResponse, buildErrorResponse, buildCorsPreflightResponse } = require('../utils/js-helpers');

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * List users from Cognito User Pool
 */
exports.handler = async (event) => {
  const headers = event.headers || {};
  const requestOrigin = headers.Origin || headers.origin;

  // Handle CORS preflight (OPTIONS) requests
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
      return buildCorsPreflightResponse(requestOrigin);
  }

  try {
    console.log('Listing users, event:', JSON.stringify(event));
    
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 60;
    const paginationToken = queryParams.nextToken || null;
    
    // Parameters for Cognito listUsers API
    const params = {
      UserPoolId: USER_POOL_ID,
      Limit: limit
    };
    
    // Add pagination token if provided
    if (paginationToken) {
      params.PaginationToken = paginationToken;
    }
    
    // Call Cognito to list users
    const cognitoResponse = await cognito.listUsers(params).promise();
    
    // Transform users for client consumption
    const transformedUsers = transformUsersForClient(cognitoResponse.Users);
    
    // Return response
    return buildResponse(200, {
        users: transformedUsers,
        nextToken: cognitoResponse.PaginationToken || null
    }, requestOrigin);
  } catch (error) {
    console.error('Error listing users:', error);
    
    return buildErrorResponse(500, error.name || 'CognitoListUsersError', error.message || 'Failed to list users', requestOrigin);
  }
};
