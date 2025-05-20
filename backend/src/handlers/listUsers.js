const AWS = require('aws-sdk');
const { transformUsersForClient } = require('../utils/user-helpers');

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * List users from Cognito User Pool
 */
exports.handler = async (event) => {
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
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net', // CORS header
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        users: transformedUsers,
        nextToken: cognitoResponse.PaginationToken || null
      })
    };
  } catch (error) {
    console.error('Error listing users:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net', // CORS header
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Failed to list users',
        message: error.message
      })
    };
  }
};
