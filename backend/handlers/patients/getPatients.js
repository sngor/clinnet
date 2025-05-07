// src/handlers/patients/getPatients.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const params = {
    TableName: process.env.PATIENTS_TABLE
  };
  
  try {
    const result = await dynamoDB.scan(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('Error fetching patients:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Error fetching patients', error: error.message })
    };
  }
};