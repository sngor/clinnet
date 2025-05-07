const { queryDynamoDB } = require('../../utils/db-utils');

exports.handler = async (event) => {
  const tableName = process.env.PATIENTS_TABLE;
  const patients = await queryDynamoDB(tableName);
  return {
    statusCode: 200,
    body: JSON.stringify(patients),
  };
};