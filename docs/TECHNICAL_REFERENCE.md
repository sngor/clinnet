# 🔧 Clinnet EMR Technical Reference

Complete technical documentation for the Clinnet EMR healthcare management system.

## 🏗️ **System Architecture**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet Users                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   CloudFront CDN                                │
│              (Global Content Delivery)                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐    ┌─────────────────────────┐
        │      S3 Static Web        │    │      API Gateway        │
        │    (React Frontend)       │    │     (REST API)          │
        └───────────────────────────┘    └─────────────┬───────────┘
                                                       │
                                         ┌─────────────▼───────────┐
                                         │      AWS Cognito        │
                                         │   (Authentication)      │
                                         └─────────────┬───────────┘
                                                       │
                                         ┌─────────────▼───────────┐
                                         │   Lambda Functions      │
                                         │  (Business Logic)       │
                                         └─────────────┬───────────┘
                                                       │
                    ┌──────────────────────────────────┼──────────────────────────────────┐
                    │                                  │                                  │
        ┌───────────▼──────────┐          ┌───────────▼──────────┐          ┌───────────▼──────────┐
        │   Aurora Serverless  │          │      DynamoDB        │          │         S3           │
        │   (Relational Data)  │          │   (Document Data)    │          │  (File Storage)      │
        └──────────────────────┘          └──────────────────────┘          └──────────────────────┘
```

### **Technology Stack**

**Frontend Layer:**

- **React 18+** - Modern UI framework with hooks and concurrent features
- **Material-UI v5** - Professional design system with theming
- **Vite** - Fast build tool with HMR and optimized bundling
- **React Router v6** - Client-side routing with lazy loading
- **Axios** - HTTP client with request/response interceptors
- **AWS Amplify** - AWS service integration helpers

**API Layer:**

- **AWS API Gateway** - RESTful API with CORS and throttling
- **AWS Lambda** - Serverless compute with Python 3.12 runtime
- **AWS Cognito** - Authentication, authorization, and user management
- **Lambda Layers** - Shared code and dependencies

**Data Layer:**

- **Aurora Serverless v2** - Auto-scaling MySQL for relational data
- **DynamoDB** - NoSQL for documents and high-throughput operations
- **S3** - Object storage for files, images, and static assets
- **ElastiCache** - Redis caching layer (optional)

**Infrastructure Layer:**

- **AWS SAM** - Infrastructure as Code with CloudFormation
- **VPC** - Network isolation with public/private subnets
- **CloudFront** - Global CDN with edge caching
- **CloudWatch** - Monitoring, logging, and alerting

## 📊 **Database Design**

### **Aurora Serverless v2 (MySQL)**

**Core Tables:**

```sql
-- Patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (last_name, first_name),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id VARCHAR(100) NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    appointment_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);
```

### **DynamoDB Tables**

**Medical Reports Table:**

```json
{
  "TableName": "clinnet-medical-reports-v2-{environment}",
  "KeySchema": [{ "AttributeName": "id", "KeyType": "HASH" }],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "PatientIdIndex",
      "KeySchema": [{ "AttributeName": "patientId", "KeyType": "HASH" }]
    },
    {
      "IndexName": "DoctorIdIndex",
      "KeySchema": [{ "AttributeName": "doctorId", "KeyType": "HASH" }]
    }
  ]
}
```

**Services Table:**

```json
{
  "TableName": "clinnet-services-v2-{environment}",
  "KeySchema": [{ "AttributeName": "id", "KeyType": "HASH" }],
  "Attributes": {
    "id": "String",
    "name": "String",
    "description": "String",
    "price": "Number",
    "duration": "Number",
    "category": "String",
    "active": "Boolean"
  }
}
```

## 🔌 **API Reference**

### **Authentication**

All API endpoints (except health checks) require authentication via AWS Cognito JWT tokens.

**Headers Required:**

```http
Authorization: Bearer <cognito-jwt-token>
Content-Type: application/json
```

### **Core Endpoints**

**Patient Management:**

```http
GET    /api/patients              # List patients with pagination
GET    /api/patients/{id}         # Get patient details
POST   /api/patients              # Create new patient
PUT    /api/patients/{id}         # Update patient
DELETE /api/patients/{id}         # Delete patient
```

**Appointment Management:**

```http
GET    /api/appointments          # List appointments with filters
GET    /api/appointments/{id}     # Get appointment details
POST   /api/appointments          # Schedule appointment
PUT    /api/appointments/{id}     # Update appointment
DELETE /api/appointments/{id}     # Cancel appointment
```

**Medical Records:**

```http
GET    /api/medical-reports                    # List all reports
GET    /api/medical-reports/{id}              # Get report details
GET    /api/medical-reports/patient/{id}      # Get patient reports
GET    /api/medical-reports/doctor/{id}       # Get doctor reports
POST   /api/medical-reports                   # Create new report
PUT    /api/medical-reports/{id}              # Update report
DELETE /api/medical-reports/{id}              # Delete report
POST   /api/medical-reports/{id}/images       # Upload image to report
```

**User Management:**

```http
GET    /api/users                 # List system users
POST   /api/users                 # Create new user
PUT    /api/users/{id}            # Update user
DELETE /api/users/{id}            # Delete user
```

**Services Management:**

```http
GET    /api/services              # List medical services
GET    /api/services/{id}         # Get service details
POST   /api/services              # Create new service
PUT    /api/services/{id}         # Update service
DELETE /api/services/{id}         # Delete service
```

**System Diagnostics:**

```http
GET    /api/diagnostics/database  # Database connectivity check
GET    /api/diagnostics/s3        # S3 connectivity check
GET    /api/reports/aggregated    # System analytics
```

### **Request/Response Examples**

**Create Patient:**

```http
POST /api/patients
Content-Type: application/json
Authorization: Bearer <token>

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

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Patient created successfully"
}
```

## 🔒 **Security Architecture**

### **Authentication Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Cognito   │───▶│ API Gateway │───▶│   Lambda    │
│   (React)   │    │   (Auth)    │    │  (Validate) │    │ (Business)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   JWT Token          User Pool ID        Authorizer          User Context
```

### **Role-Based Access Control**

**Admin Role:**

- Complete system access
- User management
- System configuration
- Reports and analytics

**Doctor Role:**

- Patient medical records
- Appointment management
- Medical report creation
- Limited user profile access

**Front Desk Role:**

- Patient registration
- Appointment scheduling
- Basic patient information
- Checkout processes

### **Data Encryption**

**At Rest:**

- Aurora: AES-256 encryption
- DynamoDB: AWS managed encryption
- S3: Server-side encryption (SSE-S3)
- Lambda: Environment variables encrypted

**In Transit:**

- HTTPS/TLS 1.2+ for all communications
- API Gateway with SSL certificates
- CloudFront with HTTPS redirect
- Database connections over SSL

### **Network Security**

**VPC Configuration:**

```yaml
VPC: 10.0.0.0/16
  ├── Public Subnet: 10.0.0.0/24 (NAT Gateway, Load Balancer)
  ├── Private Subnet 1: 10.0.1.0/24 (Lambda Functions)
  ├── Private Subnet 2: 10.0.2.0/24 (Database)
  └── Security Groups:
      ├── Lambda SG: HTTPS outbound, Database access
      └── Database SG: MySQL from Lambda SG only
```

## ⚡ **Performance Optimization**

### **Frontend Performance**

**Bundle Optimization:**

- Code splitting by route and component
- Lazy loading for non-critical components
- Tree shaking to eliminate unused code
- Compression and minification

**Caching Strategy:**

```javascript
// Service Worker caching
const CACHE_STRATEGY = {
  static: "cache-first", // JS, CSS, images
  api: "network-first", // API responses
  documents: "stale-while-revalidate", // User documents
};
```

**CDN Configuration:**

```yaml
CloudFront:
  CacheBehaviors:
    - PathPattern: "*.js|*.css|*.png|*.jpg"
      TTL: 31536000 # 1 year
    - PathPattern: "*.html"
      TTL: 0 # No cache
    - PathPattern: "/api/*"
      TTL: 300 # 5 minutes
```

### **Backend Performance**

**Lambda Optimization:**

- Provisioned concurrency for critical functions
- Connection pooling for database access
- Efficient memory allocation (256MB-1GB)
- Cold start mitigation strategies

**Database Optimization:**

```sql
-- Optimized indexes
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_patients_search ON patients(last_name, first_name, email);

-- Query optimization
SELECT p.*, a.appointment_date
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.last_name LIKE 'Smith%'
ORDER BY p.last_name, p.first_name
LIMIT 20;
```

**DynamoDB Performance:**

- Partition key design for even distribution
- Global Secondary Indexes for query patterns
- Batch operations for bulk data access
- Connection reuse and connection pooling

## 📊 **Monitoring & Observability**

### **CloudWatch Metrics**

**Application Metrics:**

- API Gateway: Request count, latency, error rate
- Lambda: Duration, error count, concurrent executions
- Aurora: CPU utilization, connections, query performance
- DynamoDB: Read/write capacity, throttling events

**Custom Metrics:**

```python
import boto3
cloudwatch = boto3.client('cloudwatch')

# Custom business metrics
cloudwatch.put_metric_data(
    Namespace='Clinnet/Business',
    MetricData=[
        {
            'MetricName': 'PatientsRegistered',
            'Value': 1,
            'Unit': 'Count',
            'Dimensions': [
                {'Name': 'Environment', 'Value': 'prod'}
            ]
        }
    ]
)
```

### **Logging Strategy**

**Structured Logging:**

```python
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def log_event(event_type, details):
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'details': details,
        'environment': os.environ.get('ENVIRONMENT'),
        'function_name': context.function_name
    }
    logger.info(json.dumps(log_entry))
```

### **Alerting Configuration**

**Critical Alerts:**

- API Gateway 5xx errors > 1%
- Lambda function errors > 5%
- Database connection failures
- High response latency (>2 seconds)

**Warning Alerts:**

- High memory utilization (>80%)
- Unusual traffic patterns
- Failed authentication attempts
- Storage quota approaching limits

## 🔄 **Backup & Disaster Recovery**

### **Backup Strategy**

**Aurora Serverless v2:**

- Automated backups: 7-30 days retention
- Point-in-time recovery: Up to 35 days
- Cross-region snapshots for disaster recovery
- Backup encryption with AWS KMS

**DynamoDB:**

- Point-in-time recovery enabled
- On-demand backups for major changes
- Cross-region replication (optional)
- Export to S3 for long-term archival

**S3 Storage:**

- Versioning enabled for critical buckets
- Cross-region replication for documents
- Lifecycle policies for cost optimization
- Glacier archival for long-term storage

### **Disaster Recovery Plan**

**RTO/RPO Targets:**

- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 1 hour
- Data consistency: Eventually consistent

**Recovery Procedures:**

1. **Infrastructure**: Redeploy SAM template in alternate region
2. **Database**: Restore from latest cross-region snapshot
3. **Application**: Deploy latest application version
4. **DNS**: Update Route 53 to point to new region
5. **Validation**: Run automated tests to verify functionality

## 🧪 **Testing Strategy**

### **Frontend Testing**

**Unit Tests:**

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import PatientForm from "./PatientForm";

test("validates required fields", () => {
  render(<PatientForm />);
  fireEvent.click(screen.getByText("Save"));
  expect(screen.getByText("First name is required")).toBeInTheDocument();
});
```

**Integration Tests:**

```javascript
// API integration testing
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/patients", (req, res, ctx) => {
    return res(ctx.json({ patients: [] }));
  })
);
```

### **Backend Testing**

**Unit Tests:**

```python
import pytest
from moto import mock_dynamodb2
from src.handlers.patients.get_patients import lambda_handler

@mock_dynamodb2
def test_get_patients_success():
    # Setup mock DynamoDB table
    event = {'httpMethod': 'GET', 'pathParameters': None}
    context = MockContext()

    response = lambda_handler(event, context)

    assert response['statusCode'] == 200
    assert 'patients' in json.loads(response['body'])
```

**Load Testing:**

```bash
# Artillery.js load testing
artillery run load-test-config.yml

# Configuration example
config:
  target: 'https://api.clinnet-emr.com'
  phases:
    - duration: 300
      arrivalRate: 10
scenarios:
  - name: "Patient API Load Test"
    requests:
      - get:
          url: "/api/patients"
```

## 📈 **Scalability Considerations**

### **Auto-Scaling Configuration**

**Aurora Serverless v2:**

- Min ACU: 0.5 (development), 2 (production)
- Max ACU: 16 (development), 64 (production)
- Scaling policy: Target 70% CPU utilization

**Lambda Concurrency:**

- Reserved concurrency: 100 per critical function
- Provisioned concurrency: 10 for high-traffic functions
- Dead letter queues for failed invocations

**DynamoDB:**

- On-demand billing mode for variable workloads
- Auto-scaling for provisioned mode
- Global tables for multi-region access

### **Performance Benchmarks**

**Target Performance:**

- API response time: <200ms (95th percentile)
- Frontend load time: <3 seconds (first visit)
- Database query time: <100ms (simple queries)
- File upload time: <30 seconds (10MB files)

**Capacity Planning:**

- Concurrent users: 100-500 (typical clinic)
- Daily transactions: 1,000-10,000
- Data growth: 1GB-10GB per month
- Peak traffic: 3x average during business hours

---

## 🔗 **Additional Resources**

### **AWS Documentation**

- [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/)
- [Aurora Serverless v2 Guide](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)

### **Best Practices**

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Application Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Material-UI Guidelines](https://mui.com/material-ui/getting-started/)

**Complete technical reference for building and maintaining Clinnet EMR!** 🏥⚡
