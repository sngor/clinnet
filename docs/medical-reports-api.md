# Medical Reports API

## 1. Overview

The Medical Reports API provides functionality to manage medical reports within the Clinnet-EMR system. It allows for the creation, retrieval, updating, and deletion of medical reports.

This API is built using a serverless architecture on AWS, leveraging:
*   **AWS Lambda**: For the backend logic of handling requests.
*   **Amazon API Gateway**: To define and expose the HTTP endpoints.
*   **Amazon DynamoDB**: As the NoSQL database to store medical report data.

## 2. Authentication

All endpoints provided by the Medical Reports API are protected and require authentication. Clients must include a JSON Web Token (JWT) obtained from AWS Cognito in the `Authorization` header of their requests.

The format is:
`Authorization: Bearer <token>`

For more general information on authentication with the Clinnet-EMR APIs, please refer to the main API authentication documentation (if available).

## 3. API Endpoints

The following sections detail the available API endpoints for managing medical reports.

---

### Create Medical Report

*   **HTTP Method and Path**: `POST /reports`
*   **Description**: Creates a new medical report.
*   **Request Body**:
    *   `patientId` (String, Required): The unique identifier of the patient associated with this report.
    *   `doctorId` (String, Required): The unique identifier of the doctor creating or associated with this report.
    *   `reportContent` (String, Required): The main content of the medical report.
    *   **Example Request Body**:
        ```json
        {
          "patientId": "patient-12345",
          "doctorId": "doctor-67890",
          "reportContent": "Patient reports feeling better. Vitals are stable. Continue current medication."
        }
        ```
*   **Successful Response**:
    *   **Status Code**: `201 Created`
    *   **Example Response Body**:
        ```json
        {
          "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "patientId": "patient-12345",
          "doctorId": "doctor-67890",
          "reportContent": "Patient reports feeling better. Vitals are stable. Continue current medication.",
          "doctorNotes": "",
          "imageReferences": [],
          "imagePresignedUrls": [],
          "imageReferences": [
            "reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid1-scan.jpg"
          ],
          "imagePresignedUrls": [
            "https://<bucket-name>.s3.<region>.amazonaws.com/reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid1-scan.jpg?AWSAccessKeyId=..."
          ],
          "createdAt": "2023-10-27T10:00:00.000Z",
          "updatedAt": "2023-10-27T10:00:00.000Z"
        }
        ```
---

### Get Medical Report by ID

*   **HTTP Method and Path**: `GET /reports/{reportId}`
*   **Description**: Retrieves a specific medical report by its unique ID.
*   **Path Parameters**:
    *   `reportId` (String, Required): The unique identifier of the medical report to retrieve.
*   **Request Body**: None.
*   **Successful Response**:
    *   **Status Code**: `200 OK`
    *   **Example Response Body**:
        ```json
        {
          "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "patientId": "patient-12345",
          "doctorId": "doctor-67890",
          "reportContent": "Patient reports feeling better. Vitals are stable. Continue current medication.",
          "doctorNotes": "",
          "createdAt": "2023-10-27T10:00:00.000Z",
          "updatedAt": "2023-10-27T10:00:00.000Z"
        }
        ```
---

### Get Reports by Patient ID

*   **HTTP Method and Path**: `GET /reports/patient/{patientId}`
*   **Description**: Retrieves all medical reports associated with a specific patient ID.
*   **Path Parameters**:
    *   `patientId` (String, Required): The unique identifier of the patient whose reports are to be retrieved.
*   **Request Body**: None.
*   **Successful Response**:
    *   **Status Code**: `200 OK`
    *   **Example Response Body**:
        ```json
        [
          {
            "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "patientId": "patient-12345",
            "doctorId": "doctor-67890",
            "reportContent": "Patient reports feeling better. Vitals are stable. Continue current medication.",
            "doctorNotes": "",
            "imageReferences": [],
            "imagePresignedUrls": [],
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z"
          },
          {
            "reportId": "x1y2z3w4-v5u6-7890-1234-567890uvwxyz",
            "patientId": "patient-12345",
            "doctorId": "doctor-11223",
            "reportContent": "Follow-up consultation. Patient shows significant improvement.",
            "doctorNotes": "Reduced medication dosage.",
            "imageReferences": [
              "reports/x1y2z3w4-v5u6-7890-1234-567890uvwxyz/uuid-mri.png"
            ],
            "imagePresignedUrls": [
              "https://<bucket-name>.s3.<region>.amazonaws.com/reports/x1y2z3w4-v5u6-7890-1234-567890uvwxyz/uuid-mri.png?AWSAccessKeyId=..."
            ],
            "createdAt": "2023-11-05T14:30:00.000Z",
            "updatedAt": "2023-11-05T14:35:00.000Z"
          }
        ]
        ```
---

### Get Reports by Doctor ID

*   **HTTP Method and Path**: `GET /reports/doctor/{doctorId}`
*   **Description**: Retrieves all medical reports associated with a specific doctor ID.
*   **Path Parameters**:
    *   `doctorId` (String, Required): The unique identifier of the doctor whose reports are to be retrieved.
*   **Request Body**: None.
*   **Successful Response**:
    *   **Status Code**: `200 OK`
    *   **Example Response Body**: (Similar structure to "Get Reports by Patient ID", but filtered by `doctorId`)
        ```json
        [
          {
            "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "patientId": "patient-12345",
            "doctorId": "doctor-67890",
            "reportContent": "Patient reports feeling better. Vitals are stable. Continue current medication.",
            "doctorNotes": "",
            "imageReferences": [],
            "imagePresignedUrls": [],
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z"
          }
        ]
        ```
---

### Update Medical Report

*   **HTTP Method and Path**: `PUT /reports/{reportId}`
*   **Description**: Updates an existing medical report. Only `reportContent` and `doctorNotes` can be updated.
*   **Path Parameters**:
    *   `reportId` (String, Required): The unique identifier of the medical report to update.
*   **Request Body**:
    *   `reportContent` (String, Optional): The new content for the medical report.
    *   `doctorNotes` (String, Optional): Additional notes from the doctor.
    *   At least one of `reportContent` or `doctorNotes` must be provided.
    *   **Example Request Body**:
        ```json
        {
          "reportContent": "Patient condition has improved. Vitals are normal. Discontinue medication after 3 days.",
          "doctorNotes": "Patient advised for a follow-up after 1 month for routine check-up."
        }
        ```
*   **Successful Response**:
    *   **Status Code**: `200 OK`
    *   **Example Response Body**: (Contains the complete updated report)
        ```json
        {
          "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "patientId": "patient-12345",
          "doctorId": "doctor-67890",
          "reportContent": "Patient condition has improved. Vitals are normal. Discontinue medication after 3 days.",
          "doctorNotes": "Patient advised for a follow-up after 1 month for routine check-up.",
          "imageReferences": [
            "reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid1-scan.jpg"
          ],
          "imagePresignedUrls": [
            "https://<bucket-name>.s3.<region>.amazonaws.com/reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid1-scan.jpg?AWSAccessKeyId=..."
          ],
          "createdAt": "2023-10-27T10:00:00.000Z",
          "updatedAt": "2023-10-27T10:15:00.000Z"
        }
        ```
---

### Upload Image to Report

*   **HTTP Method and Path**: `POST /reports/{reportId}/images`
*   **Description**: Uploads an image and associates it with an existing medical report. The image is stored in S3, and a reference is added to the report.
*   **Path Parameters**:
    *   `reportId` (String, Required): The unique identifier of the medical report.
*   **Request Body**:
    *   `imageName` (String, Required): The name of the image file (e.g., "scan.jpg", "xray.png").
    *   `imageData` (String, Required): The base64 encoded image data. It's recommended to not include the data URI prefix (e.g., `data:image/png;base64,`) in the actual string sent, just the pure base64 content.
    *   `contentType` (String, Required): The MIME type of the image (e.g., "image/jpeg", "image/png").
    *   **Example Request Body**:
        ```json
        {
          "imageName": "patient-x-ray.png",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
          "contentType": "image/png"
        }
        ```
*   **Successful Response**:
    *   **Status Code**: `200 OK`
    *   **Example Response Body**: (Contains the complete updated report, including the new image reference and all presigned URLs for associated images)
        ```json
        {
          "message": "Image uploaded and report updated successfully",
          "s3ObjectKey": "reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/some-uuid-patient-x-ray.png",
          "updatedReport": {
            "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "patientId": "patient-12345",
            "doctorId": "doctor-67890",
            "reportContent": "Follow-up consultation.",
            "doctorNotes": "Patient recovering well.",
            "createdAt": "2023-11-05T14:30:00.000Z",
            "updatedAt": "2023-11-05T14:35:00.000Z",
            "imageReferences": [
              "reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/some-uuid-patient-x-ray.png"
            ],
            "imagePresignedUrls": [
              "https://<bucket-name>.s3.<region>.amazonaws.com/reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/some-uuid-patient-x-ray.png?AWSAccessKeyId=..."
            ]
          }
        }
        ```
*   **Error Responses**:
    *   `400 Bad Request`: If `reportId` is missing, or if `imageName`, `imageData`, or `contentType` are missing from the request body.
    *   `404 Not Found`: If the specified `reportId` does not exist.
    *   `500 Internal Server Error`: For issues like S3 upload failure or DynamoDB update failure.

---

### Delete Medical Report

*   **HTTP Method and Path**: `DELETE /reports/{reportId}`
*   **Description**: Deletes a specific medical report by its unique ID.
*   **Path Parameters**:
    *   `reportId` (String, Required): The unique identifier of the medical report to delete.
*   **Request Body**: None.
*   **Successful Response**:
    *   **Status Code**: `204 No Content` (Note: The Lambda implementation might return `200 OK` with a message; this reflects the common REST pattern for DELETE).
    *   **Example Response Body**: None for `204 No Content`. If `200 OK`, it might be:
        ```json
        {
          "message": "Report deleted successfully" 
        }
        ```
---

### Common Error Responses

Across all endpoints, the following error responses may be encountered:

*   **`400 Bad Request`**: Typically for invalid input, such as missing required fields in the request body or malformed JSON.
    *   Example: `{"message": "Missing required fields: patientId, doctorId, reportContent"}`
*   **`401 Unauthorized`**: If the JWT is missing, invalid, or expired.
*   **`403 Forbidden`**: If the authenticated user does not have permission to perform the action (though this API doesn't currently detail role-based access distinct from authentication).
*   **`404 Not Found`**: If a requested resource (e.g., a specific report by ID) does not exist.
    *   Example: `{"message": "Report not found"}`
*   **`500 Internal Server Error`**: For unexpected server-side errors.
    *   Example: `{"message": "Internal server error. See logs for details."}`

## 4. Data Model

A medical report has the following main attributes:

*   **`reportId`** (String): The unique identifier for the medical report (Primary Key). Automatically generated upon creation.
    *   Example: `"a1b2c3d4-e5f6-7890-1234-567890abcdef"`
*   **`patientId`** (String): The identifier for the patient. This field is indexed for querying reports by patient.
    *   Example: `"patient-12345"`
*   **`doctorId`** (String): The identifier for the doctor. This field is indexed for querying reports by doctor.
    *   Example: `"doctor-67890"`
*   **`reportContent`** (String): The primary content of the medical report.
    *   Example: `"Patient reports feeling better. Vitals are stable."`
*   **`doctorNotes`** (String, Optional): Additional notes or commentary from the doctor. Can be empty.
    *   Example: `"Advised patient to continue medication for 3 more days."`
*   **`imageReferences`** (Array of Strings, Optional): An array storing the S3 object keys for any images associated with the report. These keys are primarily for internal reference and are used by the backend to generate presigned URLs.
    *   Example: `["reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid1-scan.jpg", "reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/uuid2-xray.png"]`
*   **`imagePresignedUrls`** (Array of Strings, Optional): An array containing temporary, presigned URLs for accessing the images listed in `imageReferences`. These URLs are generated on-the-fly by the API when a report is retrieved or updated. They are intended for client-side rendering of images and typically expire after a set period (e.g., 1 hour).
    *   Example: `["https://your-bucket.s3.your-region.amazonaws.com/reports/reportId/uuid1-scan.jpg?AWSAccessKeyId=...", "https://your-bucket.s3.your-region.amazonaws.com/reports/reportId/uuid2-xray.png?AWSAccessKeyId=..."]`
*   **`createdAt`** (String): An ISO 8601 timestamp indicating when the report was created.
    *   Example: `"2023-10-27T10:00:00.000Z"`
*   **`updatedAt`** (String): An ISO 8601 timestamp indicating when the report was last updated. Upon creation, this is the same as `createdAt`.
    *   Example: `"2023-10-27T10:15:00.000Z"`

**Note on Image Fields**:
The `imageReferences` and `imagePresignedUrls` fields are included in the responses of the following endpoints:
*   `GET /reports/{reportId}`
*   `GET /reports/patient/{patientId}`
*   `GET /reports/doctor/{doctorId}`
*   `POST /reports` (these fields will be present but empty, e.g., `[]`)
*   `PUT /reports/{reportId}`
*   `POST /reports/{reportId}/images` (within the `updatedReport` object in the response)

The data is stored in an Amazon DynamoDB table, with images stored in Amazon S3.
