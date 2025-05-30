// backend/src/handlers/reports/getAggregatedReports.js
'use strict';
const AWS = require('aws-sdk'); // Import AWS SDK
// TODO: Remove this SDK import if using AWS SDK v3 in a Lambda Layer
// For Lambda environment, AWS SDK v2 is available by default.
// If using a layer with v3, the import mechanism would be different:
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
// const dynamoDb = DynamoDBDocumentClient.from(ddbClient);

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const reportType = event.queryStringParameters && event.queryStringParameters.type;
  const timeRange = event.queryStringParameters && event.queryStringParameters.range;
  console.log(`Report Type: ${reportType}, Time Range: ${timeRange}`);

  // Initialize with an empty object that matches the frontend's initial state structure expectation
  let responsePayload = {
    appointments: [],
    revenue: [],
    patients: [],
  };

  if (reportType === 'appointments') {
    // For 'appointments', we only implement 'month' timeRange for now
    if (timeRange === 'month') {
      try {
        const appointmentsTableName = process.env.APPOINTMENTS_TABLE_NAME;
        if (!appointmentsTableName) {
          console.error("Appointments table name (APPOINTMENTS_TABLE_NAME) not configured in environment variables.");
          throw new Error("Appointments table configuration error.");
        }
        console.log(`Using Appointments Table: ${appointmentsTableName}`);

        // 1. Define date range for the query (e.g., last 90 days for monthly aggregation)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 90); // Query last 90 days of data

        const params = {
          TableName: appointmentsTableName,
          // Scan can be inefficient. A GSI on appointmentDate would be better for querying.
          // This example assumes appointmentDate is a string in ISO format.
          // Adjust attribute names and types if your schema is different.
          FilterExpression: "appointmentDate BETWEEN :startDate AND :endDate",
          ExpressionAttributeValues: {
            ":startDate": startDate.toISOString().split('T')[0], // YYYY-MM-DD format
            ":endDate": endDate.toISOString().split('T')[0],     // YYYY-MM-DD format
          }
        };
        
        console.log("DynamoDB Scan Params:", JSON.stringify(params));
        const result = await dynamoDb.scan(params).promise();
        console.log("DynamoDB Scan Result Count:", result.Items ? result.Items.length : 0);

        // 2. Process items
        const monthlyData = {}; // e.g., { "2023-10": { name: "Oct", completed: 0, cancelled: 0, total: 0 } }

        if (result.Items && result.Items.length > 0) {
          result.Items.forEach(item => {
            // Ensure appointmentDate exists and is a valid date string
            if (!item.appointmentDate || typeof item.appointmentDate !== 'string') {
              console.warn('Skipping item due to missing or invalid appointmentDate:', item);
              return;
            }
            
            const itemDate = new Date(item.appointmentDate);
             // Check if itemDate is valid after parsing
            if (isNaN(itemDate.getTime())) {
                console.warn('Skipping item due to invalid date parse for appointmentDate:', item.appointmentDate);
                return;
            }

            const year = itemDate.getFullYear();
            const month = itemDate.getMonth() + 1; // JavaScript months are 0-indexed
            const monthYearKey = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM
            
            // Get short month name (e.g., "Jan", "Feb") using a robust method
            let monthName;
            try {
                monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(itemDate);
            } catch (e) {
                console.warn(`Could not format month name for date ${item.appointmentDate}, using fallback. Error: ${e}`);
                // Fallback for environments where Intl might not be fully supported or for invalid dates
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                monthName = monthNames[itemDate.getMonth()];
            }

            if (!monthlyData[monthYearKey]) {
              monthlyData[monthYearKey] = { name: `${monthName} ${year}`, completed: 0, cancelled: 0, total: 0 };
            }

            monthlyData[monthYearKey].total++;
            // Ensure status exists, default to "Unknown" or similar if not
            const status = item.status || "Unknown"; 

            if (status === 'Completed') {
              monthlyData[monthYearKey].completed++;
            } else if (status === 'Cancelled') {
              monthlyData[monthYearKey].cancelled++;
            }
            // Other statuses are counted in total but not separately
          });
        }
        
        // Convert to array format expected by frontend, sort by monthYearKey (YYYY-MM)
        responsePayload.appointments = Object.keys(monthlyData)
          .sort() // Sorts keys alphabetically, which works for "YYYY-MM" format
          .map(key => monthlyData[key]);
        
        console.log("Processed appointments data:", JSON.stringify(responsePayload.appointments));

      } catch (error) {
        console.error("Error fetching/processing appointments report:", error);
        // For the frontend, return empty data for this report on error,
        // but the error is logged for backend troubleshooting.
        responsePayload.appointments = []; 
        // Optionally, you might want to change the HTTP status code for critical errors,
        // but for now, we'll return 200 with potentially empty data.
      }
    } else {
      // For 'appointments' but other timeRanges, return empty for now or specific mock.
      console.log(`Time range '${timeRange}' for appointments not yet implemented. Returning empty array.`);
      responsePayload.appointments = [];
    }
  } else if (reportType === 'revenue' && timeRange === 'month') {
    // Keep existing mock for 'revenue' and 'month'
    responsePayload.revenue = [
      { name: "Jan", revenue: 4500 }, { name: "Feb", revenue: 5200 }, { name: "Mar", revenue: 6800 },
      { name: "Apr", revenue: 7100 }, { name: "May", revenue: 5400 }, { name: "Jun", revenue: 4900 },
      { name: "Jul", revenue: 3800 },
    ];
  } else if (reportType === 'patients' && timeRange === 'month') {
    // Keep existing mock for 'patients' and 'month'
    responsePayload.patients = [
      { name: "New", value: 45 }, { name: "Returning", value: 120 }, { name: "Referred", value: 25 },
    ];
  }
  // Other reportTypes or unhandled timeRanges will result in empty arrays as per initialization.

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust for specific origins in production
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responsePayload),
  };
};
