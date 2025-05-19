const AWS = require('aws-sdk');
const { transformUserForClient } = require('../utils/user-helpers');

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * Get a user from Cognito User Pool
 */
exports.handler = async (event) => {
  try {
    console.log('Getting user, event:', JSON.stringify(event));
    
    // Get user ID from path parameters
    const userId = event.pathParameters?.userId;
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'User ID is required'
        })
      };
    }
    
    // Parameters for Cognito adminGetUser API
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: userId
    };
    
    // Call Cognito to get user
    const user = await cognito.adminGetUser(params).promise();
    
    // Transform user for client consumption
    const transformedUser = transformUserForClient(user);
    
    // Return response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(transformedUser)
    };
  } catch (error) {
    console.error('Error getting user:', error);
    
    // Handle specific errors
    if (error.code === 'UserNotFoundException') {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Not Found',
          message: 'User not found'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
};
