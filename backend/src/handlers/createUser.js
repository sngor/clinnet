const AWS = require('aws-sdk');
const { transformUserForClient, extractUsernameFromEmail } = require('../utils/user-helpers');

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * Create a user in Cognito User Pool
 */
exports.handler = async (event) => {
  try {
    console.log('Creating user, event:', JSON.stringify(event));
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Extract email and extract username part
    const email = body.email || '';
    const displayUsername = extractUsernameFromEmail(email);
    
    // Required fields
    if (!email || !body.password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Email and password are required'
        })
      };
    }
    
    // Prepare user attributes
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' }
    ];
    
    // Add other attributes if provided
    if (body.firstName) userAttributes.push({ Name: 'given_name', Value: body.firstName });
    if (body.lastName) userAttributes.push({ Name: 'family_name', Value: body.lastName });
    if (body.phone) userAttributes.push({ Name: 'phone_number', Value: body.phone });
    if (body.role) userAttributes.push({ Name: 'custom:role', Value: body.role });
    if (body.profileImage) userAttributes.push({ Name: 'custom:profile_image', Value: body.profileImage });
    
    // Add preferred_username to store the display username
    userAttributes.push({ Name: 'preferred_username', Value: displayUsername });
    
    // Parameters for Cognito adminCreateUser API
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: email, // Use email as the unique identifier
      TemporaryPassword: body.password,
      MessageAction: 'SUPPRESS', // Don't send welcome email
      UserAttributes: userAttributes
    };
    
    // Call Cognito to create user
    const result = await cognito.adminCreateUser(params).promise();
    
    // Set permanent password and mark as verified
    await cognito.adminSetUserPassword({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: body.password,
      Permanent: true
    }).promise();
    
    // Transform user for client consumption
    const transformedUser = transformUserForClient(result.User);
    
    // Return response
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(transformedUser)
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific errors
    if (error.code === 'UsernameExistsException') {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Conflict',
          message: 'User with this email already exists'
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
