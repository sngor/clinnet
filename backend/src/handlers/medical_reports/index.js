// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.MEDICAL_REPORTS_TABLE;

// Helper function to format API Gateway responses
const formatResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Enable CORS
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: JSON.stringify(body),
  };
};

// Helper function for error handling
const handleError = (error, context) => {
  console.error(`Error processing request (requestId: ${context.awsRequestId}):`, error);
  // Mask internal errors for security
  const message = error.name === "ResourceNotFoundException" || error.statusCode === 404 ? "Report not found" : "Internal server error. See logs for details.";
  const statusCode = error.statusCode || (error.name === "ResourceNotFoundException" ? 404 : 500);
  return formatResponse(statusCode, { message, error: error.message, requestId: context.awsRequestId });
};

// Create Report
const createReport = async (eventBody, context) => {
  const { patientId, doctorId, reportContent } = eventBody;

  if (!patientId || !doctorId || !reportContent) {
    return formatResponse(400, { message: "Missing required fields: patientId, doctorId, reportContent" });
  }

  const reportId = uuidv4();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: tableName,
    Item: {
      reportId,
      patientId,
      doctorId,
      reportContent,
      doctorNotes: "", // Initialize doctorNotes as empty
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log("Report created successfully:", params.Item);
    return formatResponse(201, params.Item);
  } catch (error) {
    return handleError(error, context);
  }
};

// Get Report by ID
const getReportById = async (reportId, context) => {
  if (!reportId) {
    return formatResponse(400, { message: "Missing reportId path parameter" });
  }

  const params = {
    TableName: tableName,
    Key: { reportId },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (!Item) {
      console.log(`Report not found for reportId: ${reportId}`);
      return formatResponse(404, { message: "Report not found" });
    }
    console.log("Report retrieved successfully:", Item);
    return formatResponse(200, Item);
  } catch (error) {
    return handleError(error, context);
  }
};

// Get Reports by Patient ID
const getReportsByPatientId = async (patientId, context) => {
  if (!patientId) {
    return formatResponse(400, { message: "Missing patientId path parameter" });
  }
  const params = {
    TableName: tableName,
    IndexName: "PatientIdIndex",
    KeyConditionExpression: "patientId = :patientId",
    ExpressionAttributeValues: {
      ":patientId": patientId,
    },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    console.log(`Reports retrieved for patientId ${patientId}:`, Items);
    return formatResponse(200, Items || []);
  } catch (error) {
    return handleError(error, context);
  }
};

// Get Reports by Doctor ID
const getReportsByDoctorId = async (doctorId, context) => {
  if (!doctorId) {
    return formatResponse(400, { message: "Missing doctorId path parameter" });
  }
  const params = {
    TableName: tableName,
    IndexName: "DoctorIdIndex",
    KeyConditionExpression: "doctorId = :doctorId",
    ExpressionAttributeValues: {
      ":doctorId": doctorId,
    },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    console.log(`Reports retrieved for doctorId ${doctorId}:`, Items);
    return formatResponse(200, Items || []);
  } catch (error) {
    return handleError(error, context);
  }
};

// Update Report
const updateReport = async (reportId, eventBody, context) => {
  if (!reportId) {
    return formatResponse(400, { message: "Missing reportId path parameter" });
  }

  const { reportContent, doctorNotes } = eventBody;
  if (!reportContent && !doctorNotes) {
    return formatResponse(400, { message: "Missing at least one field to update: reportContent or doctorNotes" });
  }

  const timestamp = new Date().toISOString();
  let updateExpression = "set updatedAt = :updatedAt";
  const expressionAttributeValues = { ":updatedAt": timestamp };
  const expressionAttributeNames = {};

  if (reportContent !== undefined) {
    updateExpression += ", reportContent = :reportContent";
    expressionAttributeValues[":reportContent"] = reportContent;
  }
  if (doctorNotes !== undefined) {
    updateExpression += ", doctorNotes = :doctorNotes";
    expressionAttributeValues[":doctorNotes"] = doctorNotes;
  }

  const params = {
    TableName: tableName,
    Key: { reportId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  try {
    // First, check if the item exists
    const getItemParams = { TableName: tableName, Key: { reportId } };
    const { Item: existingItem } = await docClient.send(new GetCommand(getItemParams));
    if (!existingItem) {
        console.log(`Report not found for update, reportId: ${reportId}`);
        return formatResponse(404, { message: "Report not found, cannot update." });
    }

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    console.log("Report updated successfully:", Attributes);
    return formatResponse(200, Attributes);
  } catch (error) {
    return handleError(error, context);
  }
};

// Delete Report
const deleteReport = async (reportId, context) => {
  if (!reportId) {
    return formatResponse(400, { message: "Missing reportId path parameter" });
  }

  const params = {
    TableName: tableName,
    Key: { reportId },
  };

  try {
    // First, check if the item exists
    const getItemParams = { TableName: tableName, Key: { reportId } };
    const { Item: existingItem } = await docClient.send(new GetCommand(getItemParams));
    if (!existingItem) {
        console.log(`Report not found for deletion, reportId: ${reportId}`);
        return formatResponse(404, { message: "Report not found, cannot delete." });
    }

    await docClient.send(new DeleteCommand(params));
    console.log("Report deleted successfully:", reportId);
    return formatResponse(204, {}); // Or 200 with a message: { message: "Report deleted successfully" }
  } catch (error) {
    return handleError(error, context);
  }
};


// Main Lambda Handler
export const handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Context:", JSON.stringify(context, null, 2)); // Log context for more info

  // Ensure tableName is loaded
  if (!tableName) {
    console.error("MEDICAL_REPORTS_TABLE environment variable not set.");
    return formatResponse(500, { message: "Internal server error: Configuration missing."});
  }

  const httpMethod = event.httpMethod;
  const path = event.path; // e.g., /reports, /reports/{reportId}, /reports/patient/{patientId}
  const body = event.body ? JSON.parse(event.body) : {};
  const pathParameters = event.pathParameters || {};

  // Basic routing based on method and path pattern
  // This will be more robustly defined by API Gateway event mappings
  try {
    if (httpMethod === "POST" && path === "/reports") {
      return await createReport(body, context);
    } else if (httpMethod === "GET" && pathParameters.reportId && path.startsWith("/reports/") && !path.includes("/patient/") && !path.includes("/doctor/")) {
      return await getReportById(pathParameters.reportId, context);
    } else if (httpMethod === "GET" && pathParameters.patientId && path.startsWith("/reports/patient/")) {
      return await getReportsByPatientId(pathParameters.patientId, context);
    } else if (httpMethod === "GET" && pathParameters.doctorId && path.startsWith("/reports/doctor/")) {
      return await getReportsByDoctorId(pathParameters.doctorId, context);
    } else if (httpMethod === "PUT" && pathParameters.reportId && path.startsWith("/reports/")) {
      return await updateReport(pathParameters.reportId, body, context);
    } else if (httpMethod === "DELETE" && pathParameters.reportId && path.startsWith("/reports/")) {
      return await deleteReport(pathParameters.reportId, context);
    } else if (httpMethod === "OPTIONS") {
      // Handle preflight CORS requests
      console.log("Handling OPTIONS request");
      return formatResponse(200, { message: "CORS preflight check successful" });
    } else {
      console.log("Route not found for method and path:", httpMethod, path);
      return formatResponse(404, { message: "Not Found: The requested resource or method was not found." });
    }
  } catch (error) {
    // Catch any unhandled synchronous errors or promise rejections from async handlers
    return handleError(error, context);
  }
};
