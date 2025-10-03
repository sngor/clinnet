# 🔌 Clinnet EMR API Reference

Complete API reference for the Clinnet EMR healthcare management system.

## 🔐 **Authentication**

All API endpoints require authentication via AWS Cognito JWT tokens.

**Required Headers:**

```http
Authorization: Bearer <cognito-jwt-token>
Content-Type: application/json
```

**Base URL:**

```
https://your-api-id.execute-api.region.amazonaws.com/dev/api
```

## 👥 **Patient Management**

### **List Patients**

```http
GET /patients
```

**Query Parameters:**

- `limit` (optional): Number of results to return (default: 20)
- `lastEvaluatedKey` (optional): Pagination token

**Response:**

```json
{
  "patients": [
    {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123",
      "dateOfBirth": "1985-06-15",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "lastEvaluatedKey": "pagination-token"
}
```

### **Get Patient by ID**

```http
GET /patients/{id}
```

### **Create Patient**

```http
POST /patients
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "dateOfBirth": "1985-06-15",
  "gender": "male",
  "address": "123 Main St, City, State 12345",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1-555-0124",
  "insuranceProvider": "Blue Cross",
  "insurancePolicyNumber": "BC123456789"
}
```

### **Update Patient**

```http
PUT /patients/{id}
```

### **Delete Patient**

```http
DELETE /patients/{id}
```

## 📅 **Appointment Management**

### **List Appointments**

```http
GET /appointments
```

**Query Parameters:**

- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status

### **Get Appointment by ID**

```http
GET /appointments/{id}
```

### **Create Appointment**

```http
POST /appointments
```

**Request Body:**

```json
{
  "patientId": 123,
  "doctorId": "doctor-67890",
  "appointmentDate": "2024-02-15T14:30:00Z",
  "durationMinutes": 30,
  "appointmentType": "consultation",
  "notes": "Regular checkup"
}
```

### **Update Appointment**

```http
PUT /appointments/{id}
```

### **Cancel Appointment**

```http
DELETE /appointments/{id}
```

## 📋 **Medical Records**

### **List Medical Reports**

```http
GET /medical-reports
```

### **Get Report by ID**

```http
GET /medical-reports/{id}
```

**Response:**

```json
{
  "reportId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "patientId": "patient-12345",
  "doctorId": "doctor-67890",
  "reportContent": "Patient reports feeling better. Vitals are stable.",
  "doctorNotes": "Continue current medication.",
  "imageReferences": ["reports/a1b2c3d4-e5f6-7890-1234-567890abcdef/scan.jpg"],
  "imagePresignedUrls": [
    "https://bucket.s3.region.amazonaws.com/reports/reportId/scan.jpg?AWSAccessKeyId=..."
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:15:00Z"
}
```

### **Get Reports by Patient**

```http
GET /medical-reports/patient/{patientId}
```

### **Get Reports by Doctor**

```http
GET /medical-reports/doctor/{doctorId}
```

### **Create Medical Report**

```http
POST /medical-reports
```

**Request Body:**

```json
{
  "patientId": "patient-12345",
  "doctorId": "doctor-67890",
  "reportContent": "Patient reports feeling better. Vitals are stable."
}
```

### **Update Medical Report**

```http
PUT /medical-reports/{id}
```

**Request Body:**

```json
{
  "reportContent": "Updated report content",
  "doctorNotes": "Additional notes from doctor"
}
```

### **Upload Image to Report**

```http
POST /medical-reports/{id}/images
```

**Request Body:**

```json
{
  "imageName": "patient-x-ray.png",
  "imageData": "base64-encoded-image-data",
  "contentType": "image/png"
}
```

### **Delete Medical Report**

```http
DELETE /medical-reports/{id}
```

## 🏥 **Services Management**

### **List Services**

```http
GET /services
```

**Response:**

```json
{
  "services": [
    {
      "id": "service-123",
      "name": "General Consultation",
      "description": "Standard medical consultation",
      "price": 150.0,
      "duration": 30,
      "category": "consultation",
      "active": true
    }
  ]
}
```

### **Get Service by ID**

```http
GET /services/{id}
```

### **Create Service**

```http
POST /services
```

**Request Body:**

```json
{
  "name": "General Consultation",
  "description": "Standard medical consultation",
  "price": 150.0,
  "duration": 30,
  "category": "consultation"
}
```

### **Update Service**

```http
PUT /services/{id}
```

### **Delete Service**

```http
DELETE /services/{id}
```

## 👤 **User Management**

### **List Users**

```http
GET /users
```

### **Create User**

```http
POST /users
```

**Request Body:**

```json
{
  "username": "doctor.smith",
  "email": "doctor.smith@clinic.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "doctor",
  "temporaryPassword": "TempPass123!"
}
```

### **Update User**

```http
PUT /users/{id}
```

### **Delete User**

```http
DELETE /users/{id}
```

## 📊 **Reports & Analytics**

### **Get Aggregated Reports**

```http
GET /reports/aggregated
```

**Response:**

```json
{
  "totalPatients": 150,
  "totalAppointments": 45,
  "appointmentsToday": 8,
  "appointmentsThisWeek": 32,
  "appointmentsByStatus": {
    "scheduled": 25,
    "completed": 15,
    "cancelled": 5
  },
  "recentActivity": [
    {
      "type": "appointment_created",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": "Appointment scheduled for John Doe"
    }
  ]
}
```

## 🔧 **System Diagnostics**

### **Database Health Check**

```http
GET /diagnostics/database
```

**Response:**

```json
{
  "status": "healthy",
  "connectionTime": 45,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **S3 Health Check**

```http
GET /diagnostics/s3
```

**Response:**

```json
{
  "status": "healthy",
  "bucketsAccessible": 3,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## ❌ **Error Responses**

### **Standard Error Format**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: firstName, lastName",
    "details": {
      "field": "firstName",
      "reason": "Field is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-12345"
}
```

### **Common HTTP Status Codes**

| Code | Description           | Common Causes                                   |
| ---- | --------------------- | ----------------------------------------------- |
| 400  | Bad Request           | Invalid input, missing required fields          |
| 401  | Unauthorized          | Missing or invalid JWT token                    |
| 403  | Forbidden             | Insufficient permissions for operation          |
| 404  | Not Found             | Resource does not exist                         |
| 409  | Conflict              | Resource already exists or constraint violation |
| 429  | Too Many Requests     | Rate limit exceeded                             |
| 500  | Internal Server Error | Server-side error, check logs                   |

### **Error Code Reference**

| Error Code             | Description                   | Resolution                                  |
| ---------------------- | ----------------------------- | ------------------------------------------- |
| `VALIDATION_ERROR`     | Input validation failed       | Check required fields and formats           |
| `AUTHENTICATION_ERROR` | JWT token invalid             | Refresh authentication token                |
| `AUTHORIZATION_ERROR`  | Insufficient permissions      | Check user role and permissions             |
| `RESOURCE_NOT_FOUND`   | Requested resource not found  | Verify resource ID exists                   |
| `DUPLICATE_RESOURCE`   | Resource already exists       | Use different identifier or update existing |
| `DATABASE_ERROR`       | Database operation failed     | Check system status, retry if temporary     |
| `S3_ERROR`             | File storage operation failed | Check file size and format                  |

## 🔄 **Rate Limiting**

**Default Limits:**

- **Authenticated requests**: 1000 requests per minute per user
- **Unauthenticated requests**: 100 requests per minute per IP
- **File uploads**: 10 uploads per minute per user

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642234567
```

## 📝 **Request/Response Examples**

### **Pagination Example**

```http
GET /patients?limit=10&lastEvaluatedKey=eyJpZCI6MTIz...

Response:
{
  "patients": [...],
  "lastEvaluatedKey": "eyJpZCI6MTMz...",
  "hasMore": true
}
```

### **Filtering Example**

```http
GET /appointments?doctorId=doctor-123&date=2024-01-15&status=scheduled

Response:
{
  "appointments": [...],
  "totalCount": 5,
  "filters": {
    "doctorId": "doctor-123",
    "date": "2024-01-15",
    "status": "scheduled"
  }
}
```

### **Bulk Operations Example**

```http
POST /patients/bulk
Content-Type: application/json

{
  "patients": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }
  ]
}

Response:
{
  "created": 2,
  "failed": 0,
  "results": [
    {"id": 123, "status": "created"},
    {"id": 124, "status": "created"}
  ]
}
```

## 🔗 **SDK and Integration**

### **JavaScript/TypeScript**

```javascript
// Using axios
const api = axios.create({
  baseURL: "https://your-api-gateway-url/dev/api",
  headers: {
    Authorization: `Bearer ${cognitoToken}`,
    "Content-Type": "application/json",
  },
});

// Get patients
const patients = await api.get("/patients");

// Create patient
const newPatient = await api.post("/patients", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});
```

### **Python**

```python
import requests

headers = {
    'Authorization': f'Bearer {cognito_token}',
    'Content-Type': 'application/json'
}

# Get patients
response = requests.get(
    'https://your-api-gateway-url/dev/api/patients',
    headers=headers
)
patients = response.json()

# Create patient
patient_data = {
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john@example.com'
}
response = requests.post(
    'https://your-api-gateway-url/dev/api/patients',
    json=patient_data,
    headers=headers
)
```

---

## 📞 **Support**

- **API Issues**: Check [Troubleshooting Guide](troubleshooting.md)
- **Authentication**: See [Technical Reference](TECHNICAL_REFERENCE.md#security-architecture)
- **Deployment**: Follow [Deployment Guide](DEPLOYMENT_GUIDE.md)

**Complete API reference for your healthcare management system!** 🏥🔌
