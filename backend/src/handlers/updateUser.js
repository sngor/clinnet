const AWS = require('aws-sdk');
const { transformUserForClient, extractUsernameFromEmail } = require('../utils/user-helpers');

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * Update a user in Cognito User Pool
 */
exports.handler = async (event) => {
  try {
    console.log('Updating user, event:', JSON.stringify(event));
    
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
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Extract email and derive display username if email is changing
    const email = body.email;
    const displayUsername = email ? extractUsernameFromEmail(email) : null;
    
    // Prepare user attributes
    const userAttributes = [];
    
    // Add attributes if provided
    if (email) userAttributes.push({ Name: 'email', Value: email });
    if (body.firstName) userAttributes.push({ Name: 'given_name', Value: body.firstName });
    if (body.lastName) userAttributes.push({ Name: 'family_name', Value: body.lastName });
    if (body.phone) userAttributes.push({ Name: 'phone_number', Value: body.phone });
    if (body.role) userAttributes.push({ Name: 'custom:role', Value: body.role });
    if (body.profileImage) userAttributes.push({ Name: 'custom:profileImage', Value: body.profileImage });
    
    // Update preferred_username if email is changing
    if (displayUsername) {
      userAttributes.push({ Name: 'preferred_username', Value: displayUsername });
    }
    
    // Skip update if no attributes to update
    if (userAttributes.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'No attributes to update'
        })
      };
    }
    
    // Parameters for Cognito adminUpdateUserAttributes API
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: userId,
      UserAttributes: userAttributes
    };
    
    // Call Cognito to update user attributes
    await cognito.adminUpdateUserAttributes(params).promise();
    
    // Handle enabled/disabled state if provided
    if (body.enabled !== undefined) {
      if (body.enabled) {
        await cognito.adminEnableUser({
          UserPoolId: USER_POOL_ID,
          Username: userId
        }).promise();
      } else {
        await cognito.adminDisableUser({
          UserPoolId: USER_POOL_ID,
          Username: userId
        }).promise();
      }
    }
    
    // Get updated user
    const updatedUser = await cognito.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: userId
    }).promise();
    
    // Transform user for client consumption
    const transformedUser = transformUserForClient(updatedUser);
    
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
    console.error('Error updating user:', error);
    
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
        error: 'AWS Error',
        message: error.message
      })
    };
  }
};
