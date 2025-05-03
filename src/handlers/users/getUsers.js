// src/handlers/users/getUsers.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const params = {
    TableName: process.env.USERS_TABLE
  };
  
  try {
    const result = await dynamoDB.scan(params).promise();
    
    // Remove sensitive information like passwords before returning
    const users = result.Items.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(users)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Error fetching users', error: error.message })
    };
  }
};