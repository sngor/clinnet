// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const parser = require('aws-lambda-multipart-parser');
// Correct relative path from handlers/medical_reports/ to src/utils/
const { buildResponse, buildErrorResponse, buildCorsPreflightResponse } = require('../../utils/js-helpers');

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = process.env.MEDICAL_REPORTS_TABLE_NAME; // Ensure this matches template.yaml
const s3Client = new S3Client({});
const imageBucketName = process.env.MEDICAL_REPORTS_IMAGE_BUCKET_NAME;

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
const createReport = async (eventBody, context, requestOrigin) => {
  const { patientId, doctorId, reportContent } = eventBody;

  if (!patientId || !doctorId || !reportContent) {
    return buildErrorResponse(400, 'ValidationError', 'Missing required fields: patientId, doctorId, reportContent', requestOrigin);
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
    return buildResponse(201, createdItem, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Get Report by ID
const getReportById = async (reportId, context, requestOrigin) => {
  if (!reportId) {
    return buildErrorResponse(400, 'ValidationError', "Missing reportId path parameter", requestOrigin);
  }

  const params = {
    TableName: tableName,
    Key: { reportId },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (!Item) {
      console.log(`Report not found for reportId: ${reportId}`, context.awsRequestId);
      return buildErrorResponse(404, 'NotFound', "Report not found", requestOrigin);
    }
    if (Item.imageReferences && Item.imageReferences.length > 0) {
      Item.imagePresignedUrls = await generatePresignedUrls(Item.imageReferences, context);
    } else {
      Item.imagePresignedUrls = [];
    }
    console.log("Report retrieved successfully:", Item, context.awsRequestId);
    return buildResponse(200, Item, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Get Reports by Patient ID
const getReportsByPatientId = async (patientId, context, requestOrigin) => {
  if (!patientId) {
    return buildErrorResponse(400, 'ValidationError', "Missing patientId path parameter", requestOrigin);
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
    return buildResponse(200, reportsWithUrls, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Get Reports by Doctor ID
const getReportsByDoctorId = async (doctorId, context, requestOrigin) => {
  if (!doctorId) {
    return buildErrorResponse(400, 'ValidationError', "Missing doctorId path parameter", requestOrigin);
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
    return buildResponse(200, reportsWithUrls, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Update Report
const updateReport = async (reportId, eventBody, context, requestOrigin) => {
  if (!reportId) {
    return buildErrorResponse(400, 'ValidationError', "Missing reportId path parameter", requestOrigin);
  }

  const { reportContent, doctorNotes } = eventBody;
  if (!reportContent && !doctorNotes) {
    return buildErrorResponse(400, 'ValidationError', "Missing at least one field to update: reportContent or doctorNotes", requestOrigin);
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
        return buildErrorResponse(404, 'NotFound', "Report not found, cannot update.", requestOrigin);
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
    return buildResponse(200, Attributes, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Delete Report
const deleteReport = async (reportId, context, requestOrigin) => {
  if (!reportId) {
    return buildErrorResponse(400, 'ValidationError', "Missing reportId path parameter", requestOrigin);
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
        return buildErrorResponse(404, 'NotFound', "Report not found, cannot delete.", requestOrigin);
    }

    await docClient.send(new DeleteCommand(params));
    console.log("Report deleted successfully:", reportId);
    return buildResponse(204, {}, requestOrigin);
  } catch (error) {
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};

// Upload Image to Report
const uploadImageToReport = async (reportId, event, context, requestOrigin) => {
  if (!reportId) {
    return buildErrorResponse(400, 'ValidationError', "Missing reportId path parameter", requestOrigin);
  }

  if (!imageBucketName) {
    console.error("MEDICAL_REPORTS_IMAGE_BUCKET_NAME environment variable not set.", context.awsRequestId);
    return buildErrorResponse(500, 'ConfigurationError', "Internal server error: Image bucket configuration missing.", requestOrigin);
  }

  try {
    const form = await parser.parse(event);
    if (!form.files || form.files.length === 0 || !form.files[0]) {
      return buildErrorResponse(400, 'ValidationError', "No file uploaded or file is invalid.", requestOrigin);
    }

    const uploadedFile = form.files[0];
    const imageName = uploadedFile.filename;
    const imageBuffer = uploadedFile.content; // This is already a Buffer
    const contentType = uploadedFile.contentType;

    if (!imageName || !imageBuffer || !contentType) {
      return buildErrorResponse(400, 'ValidationError', "Missing file name, data, or content type from parsed file.", requestOrigin);
    }

    // 1. Check if the report exists
    const getItemParams = { TableName: tableName, Key: { reportId } };
    const { Item: existingReport } = await docClient.send(new GetCommand(getItemParams));
    if (!existingReport) {
      console.log(`Report not found for image upload, reportId: ${reportId}`, context.awsRequestId);
      return buildErrorResponse(404, 'NotFound', "Report not found. Cannot upload image.", requestOrigin);
    }

    // 2. Prepare image data and S3 key
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
    return buildResponse(200, { message: "Image uploaded and report updated successfully", s3ObjectKey, updatedReport: updatedReportAttributes }, requestOrigin);

  } catch (error) {
    console.error(`Error in uploadImageToReport (reportId: ${reportId}, imageName: ${imageName}):`, error, context.awsRequestId);
    if (error.name === 'NoSuchBucket') {
        return buildErrorResponse(500, 'ConfigurationError', 'Internal configuration error: S3 bucket not found.', requestOrigin);
    }
    return buildErrorResponse(error.statusCode || 500, error.name || 'OperationFailed', error.message, requestOrigin);
  }
};


// Main Lambda Handler
const handler = async (event, context) => {
  // Add AWS Request ID to all logs for better traceability
  const awsRequestId = context.awsRequestId;
  console.log(`Received event (requestId: ${awsRequestId}):`, JSON.stringify(event, null, 2));
  // console.log(`Context (requestId: ${awsRequestId}):`, JSON.stringify(context, null, 2)); // Context can be verbose

  const eventHeaders = event.headers || {};
  const requestOrigin = eventHeaders.Origin || eventHeaders.origin;

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
      console.log(`Handling OPTIONS request (requestId: ${awsRequestId})`);
      return buildCorsPreflightResponse(requestOrigin);
  }

  if (!tableName) {
    console.error(`MEDICAL_REPORTS_TABLE_NAME environment variable not set (requestId: ${awsRequestId}).`);
    return buildErrorResponse(500, 'ConfigurationError', 'Internal server error: DB Configuration missing.', requestOrigin);
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
  // Check content type before parsing JSON
  const contentTypeHeader = event.headers && (event.headers['content-type'] || event.headers['Content-Type']);
  const isMultipart = contentTypeHeader && contentTypeHeader.startsWith('multipart/form-data');

  // Only parse JSON if not multipart and body exists
  if (!isMultipart && event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Invalid JSON in request body:", event.body, context.awsRequestId);
      return buildErrorResponse(400, 'JSONParseError', 'Invalid JSON format in request body.', requestOrigin);
    }
  } else if (event.body) {
    // For multipart, body will be handled by the parser in the specific route,
    // but we can assign event.body to body if needed elsewhere, or leave body undefined.
    // For this specific case, uploadImageToReport will parse the raw event.
  } else {
    body = {};
  }
  const pathParameters = event.pathParameters || {};

  // Routing
  try {
    if (httpMethod === "POST" && path === "/reports") {
      return await createReport(body, context, requestOrigin);
    } else if (httpMethod === "POST" && path.match(/^\/reports\/[a-zA-Z0-9-]+\/images$/) && pathParameters.reportId) {
      // New route for image upload: POST /reports/{reportId}/images
      // Pass the full event here
      return await uploadImageToReport(pathParameters.reportId, event, context, requestOrigin);
    } else if (httpMethod === "GET" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await getReportById(pathParameters.reportId, context, requestOrigin);
    } else if (httpMethod === "GET" && pathParameters.patientId && path === `/reports/patient/${pathParameters.patientId}`) {
      return await getReportsByPatientId(pathParameters.patientId, context, requestOrigin);
    } else if (httpMethod === "GET" && pathParameters.doctorId && path === `/reports/doctor/${pathParameters.doctorId}`) {
      return await getReportsByDoctorId(pathParameters.doctorId, context, requestOrigin);
    } else if (httpMethod === "PUT" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await updateReport(pathParameters.reportId, body, context, requestOrigin);
    } else if (httpMethod === "DELETE" && pathParameters.reportId && path === `/reports/${pathParameters.reportId}`) {
      return await deleteReport(pathParameters.reportId, context, requestOrigin);
    // Note: OPTIONS is already handled at the top of the handler. This else if can be removed if not needed for other specific OPTIONS logic.
    // } else if (httpMethod === "OPTIONS") {
    //   console.log("Handling OPTIONS request (already handled)", context.awsRequestId);
    //   return buildCorsPreflightResponse(requestOrigin); // Should have been caught earlier
    } else {
      console.log("Route not found for method and path:", httpMethod, path, context.awsRequestId);
      return buildErrorResponse(404, 'RouteNotFound', `Not Found: The requested resource or method was not found. Method: ${httpMethod}, Path: ${path}`, requestOrigin);
    }
  } catch (error) {
    console.error(`Unhandled error in main handler (requestId: ${awsRequestId}):`, error);
    return buildErrorResponse(error.statusCode || 500, error.name || 'UnhandledError', error.message, requestOrigin);
  }
};

module.exports = { handler };
