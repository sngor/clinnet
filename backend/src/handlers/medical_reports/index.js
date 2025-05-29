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
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = process.env.MEDICAL_REPORTS_TABLE_NAME; // Ensure this matches template.yaml
const s3Client = new S3Client({});
const imageBucketName = process.env.MEDICAL_REPORTS_IMAGE_BUCKET_NAME;

// Helper function to format API Gateway responses
const formatResponse = (statusCode, body) => {
  // Ensure body is stringified if it's an object
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Enable CORS
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: responseBody,
  };
};

// Helper function for error handling
const handleError = (error, context) => {
  const requestId = context && context.awsRequestId ? context.awsRequestId : "N/A";
  console.error(`Error processing request (requestId: ${requestId}):`, error);
  // Mask internal errors for security
  const message = error.name === "ResourceNotFoundException" || error.statusCode === 404 ? "Report not found" : "Internal server error. See logs for details.";
  const statusCode = error.statusCode || (error.name === "ResourceNotFoundException" ? 404 : 500);
  return formatResponse(statusCode, { message, error: error.message, requestId });
};

// Helper function to generate presigned URLs for image keys
const generatePresignedUrls = async (imageKeys, context) => {
  const requestId = context && context.awsRequestId ? context.awsRequestId : "N/A";
  if (!imageKeys || !Array.isArray(imageKeys) || imageKeys.length === 0) {
    return [];
  }

  if (!imageBucketName) {
    console.error(`(requestId: ${requestId}) MEDICAL_REPORTS_IMAGE_BUCKET_NAME environment variable not set. Cannot generate presigned URLs.`);
    // Return original keys or empty array, as per desired error handling. Here, returning empty.
    return [];
  }

  const presignedUrls = [];
  for (const imageKey of imageKeys) {
    try {
      const command = new GetObjectCommand({ Bucket: imageBucketName, Key: imageKey });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour
      presignedUrls.push(url);
    } catch (error) {
      console.error(`(requestId: ${requestId}) Error generating presigned URL for key ${imageKey}:`, error);
      presignedUrls.push(null); // Or original key, or skip
    }
  }
  return presignedUrls;
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
      imageReferences: [], // Initialize imageReferences as an empty list
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    const createdItem = { ...params.Item };
    // Even though imageReferences is empty, we call this for consistency in response structure.
    createdItem.imagePresignedUrls = await generatePresignedUrls(createdItem.imageReferences, context);
    console.log("Report created successfully:", createdItem, context.awsRequestId);
    return formatResponse(201, createdItem);
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
      console.log(`Report not found for reportId: ${reportId}`, context.awsRequestId);
      return formatResponse(404, { message: "Report not found" });
    }
    if (Item.imageReferences && Item.imageReferences.length > 0) {
      Item.imagePresignedUrls = await generatePresignedUrls(Item.imageReferences, context);
    } else {
      Item.imagePresignedUrls = [];
    }
    console.log("Report retrieved successfully:", Item, context.awsRequestId);
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
    const reportsWithUrls = [];
    if (Items && Items.length > 0) {
      for (let item of Items) {
        if (item.imageReferences && item.imageReferences.length > 0) {
          item.imagePresignedUrls = await generatePresignedUrls(item.imageReferences, context);
        } else {
          item.imagePresignedUrls = [];
        }
        reportsWithUrls.push(item);
      }
    }
    console.log(`Reports retrieved for patientId ${patientId}:`, reportsWithUrls.length, context.awsRequestId);
    return formatResponse(200, reportsWithUrls);
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
    const reportsWithUrls = [];
    if (Items && Items.length > 0) {
      for (let item of Items) {
        if (item.imageReferences && item.imageReferences.length > 0) {
          item.imagePresignedUrls = await generatePresignedUrls(item.imageReferences, context);
        } else {
          item.imagePresignedUrls = [];
        }
        reportsWithUrls.push(item);
      }
    }
    console.log(`Reports retrieved for doctorId ${doctorId}:`, reportsWithUrls.length, context.awsRequestId);
    return formatResponse(200, reportsWithUrls);
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
        console.log(`Report not found for update, reportId: ${reportId}`, context.awsRequestId);
        return formatResponse(404, { message: "Report not found, cannot update." });
    }

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    if (Attributes) {
      if (Attributes.imageReferences && Attributes.imageReferences.length > 0) {
        Attributes.imagePresignedUrls = await generatePresignedUrls(Attributes.imageReferences, context);
      } else {
        Attributes.imagePresignedUrls = [];
      }
    }
    console.log("Report updated successfully:", Attributes, context.awsRequestId);
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

// Upload Image to Report
const uploadImageToReport = async (reportId, eventBody, context) => {
  if (!reportId) {
    return formatResponse(400, { message: "Missing reportId path parameter" });
  }

  if (!imageBucketName) {
    console.error("MEDICAL_REPORTS_IMAGE_BUCKET_NAME environment variable not set.", context.awsRequestId);
    return formatResponse(500, { message: "Internal server error: Image bucket configuration missing." });
  }

  const { imageName, imageData, contentType } = eventBody;

  if (!imageName || !imageData || !contentType) {
    return formatResponse(400, { message: "Missing required fields: imageName, imageData, contentType" });
  }

  try {
    // 1. Check if the report exists
    const getItemParams = { TableName: tableName, Key: { reportId } };
    const { Item: existingReport } = await docClient.send(new GetCommand(getItemParams));
    if (!existingReport) {
      console.log(`Report not found for image upload, reportId: ${reportId}`, context.awsRequestId);
      return formatResponse(404, { message: "Report not found. Cannot upload image." });
    }

    // 2. Prepare image data and S3 key
    const imageBuffer = Buffer.from(imageData, 'base64');
    const s3ObjectKey = `reports/${reportId}/${uuidv4()}-${imageName}`;

    // 3. Upload to S3
    const s3PutParams = {
      Bucket: imageBucketName,
      Key: s3ObjectKey,
      Body: imageBuffer,
      ContentType: contentType,
    };
    await s3Client.send(new PutObjectCommand(s3PutParams));
    console.log(`Image uploaded to S3 successfully: ${s3ObjectKey}`, context.awsRequestId);

    // 4. Update DynamoDB with the image reference
    const updateDynamoParams = {
      TableName: tableName,
      Key: { reportId },
      UpdateExpression: "SET imageReferences = list_append(if_not_exists(imageReferences, :empty_list), :new_image_ref), updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":new_image_ref": [s3ObjectKey], // list_append expects a list
        ":empty_list": [],
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes: updatedReportAttributes } = await docClient.send(new UpdateCommand(updateDynamoParams));

    if (updatedReportAttributes) {
      if (updatedReportAttributes.imageReferences && updatedReportAttributes.imageReferences.length > 0) {
        updatedReportAttributes.imagePresignedUrls = await generatePresignedUrls(updatedReportAttributes.imageReferences, context);
      } else {
        updatedReportAttributes.imagePresignedUrls = [];
      }
    }
    console.log(`Report updated with image reference: ${reportId}, image: ${s3ObjectKey}`, context.awsRequestId);
    return formatResponse(200, { message: "Image uploaded and report updated successfully", s3ObjectKey, updatedReport: updatedReportAttributes });

  } catch (error) {
    console.error(`Error in uploadImageToReport (reportId: ${reportId}, imageName: ${imageName}):`, error, context.awsRequestId);
    if (error.name === 'NoSuchBucket') {
        return formatResponse(500, { message: 'Internal configuration error: S3 bucket not found.' });
    }
    return handleError(error, context);
  }
};


// Main Lambda Handler
export const handler = async (event, context) => {
  // Add AWS Request ID to all logs for better traceability
  const awsRequestId = context.awsRequestId;
  console.log(`Received event (requestId: ${awsRequestId}):`, JSON.stringify(event, null, 2));
  // console.log(`Context (requestId: ${awsRequestId}):`, JSON.stringify(context, null, 2)); // Context can be verbose

  if (!tableName) {
    console.error(`MEDICAL_REPORTS_TABLE_NAME environment variable not set (requestId: ${awsRequestId}).`);
    return formatResponse(500, { message: "Internal server error: DB Configuration missing."});
  }
  if (!imageBucketName && !(event.httpMethod === "POST" && event.path === "/reports")) { // Bucket name not needed for creating a report initially
     // Check imageBucketName for all relevant paths, e.g. not needed for createReport
     const path = event.path;
     const httpMethod = event.httpMethod;
     // Only critical for image uploads and retrievals.
     if ( (httpMethod === "POST" && path.includes("/images")) || (httpMethod === "GET") ) {
        console.warn(`MEDICAL_REPORTS_IMAGE_BUCKET_NAME environment variable not set (requestId: ${awsRequestId}). Presigned URLs will not be generated.`);
        // Allow requests to proceed, but presigned URLs will be empty or null.
        // Alternatively, could return 500 here if presigned URLs are critical for all GETs.
     }
  }

  const httpMethod = event.httpMethod;
  const path = event.path;
  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (parseError) {
    console.error("Invalid JSON in request body:", event.body, context.awsRequestId);
    return formatResponse(400, { message: "Invalid JSON format in request body." });
  }
  const pathParameters = event.pathParameters || {};

  // Routing
  try {
    if (httpMethod === "POST" && path === "/reports") {
      return await createReport(body, context);
    } else if (httpMethod === "POST" && path.match(/^\/reports\/[a-zA-Z0-9-]+\/images$/) && pathParameters.reportId) {
      // New route for image upload: POST /reports/{reportId}/images
      return await uploadImageToReport(pathParameters.reportId, body, context);
    } else if (httpMethod === "GET" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await getReportById(pathParameters.reportId, context);
    } else if (httpMethod === "GET" && pathParameters.patientId && path === `/reports/patient/${pathParameters.patientId}`) {
      return await getReportsByPatientId(pathParameters.patientId, context);
    } else if (httpMethod === "GET" && pathParameters.doctorId && path === `/reports/doctor/${pathParameters.doctorId}`) {
      return await getReportsByDoctorId(pathParameters.doctorId, context);
    } else if (httpMethod === "PUT" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await updateReport(pathParameters.reportId, body, context);
    } else if (httpMethod === "DELETE" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await deleteReport(pathParameters.reportId, context);
    } else if (httpMethod === "OPTIONS") {
      console.log("Handling OPTIONS request", context.awsRequestId);
      return formatResponse(200, { message: "CORS preflight check successful" });
    } else {
      console.log("Route not found for method and path:", httpMethod, path, context.awsRequestId);
      return formatResponse(404, { message: `Not Found: The requested resource or method was not found. Method: ${httpMethod}, Path: ${path}` });
    }
  } catch (error) {
    return handleError(error, context);
  }
};
