# DynamoDB Structure Documentation

## Overview

The Clinnet-EMR application has been updated to use AWS DynamoDB as the primary database, which uses a single-table design with PK/SK access patterns. This document describes how the frontend components have been modified to work with this new data structure.

## DynamoDB Schema

### Patient Data

Each patient record follows this structure:

```javascript
{
  // Partition and sort keys
  PK: "PAT#12345",             // Partition key: PAT# prefix with ID
  SK: "PROFILE#1",             // Sort key: Fixed for patient profile
  id: "12345",                 // Patient ID (without prefix)

  // Global Secondary Indexes
  GSI1PK: "CLINIC#DEFAULT",    // GSI1 partition key: Clinic ID
  GSI1SK: "PAT#12345",         // GSI1 sort key: Patient ID with prefix
  GSI2PK: "PAT#12345",         // GSI2 partition key: Patient ID with prefix
  GSI2SK: "PROFILE#1",         // GSI2 sort key: Fixed for patient profile

  // Item type
  type: "PATIENT",             // Item type

  // Patient attributes
  firstName: "Jane",
  lastName: "Smith",
  dob: "1985-05-15",
  phone: "+1 (555) 123-4567",
  email: "jane.smith@example.com",
  address: "123 Main St, Anytown, CA 12345",
  insuranceProvider: "Blue Cross",
  insuranceNumber: "BC12345678",
  status: "Active",

  // Timestamps
  createdAt: "2023-01-15T08:30:00Z",
  updatedAt: "2023-05-10T14:22:00Z"
}
```

## Frontend Handling

The frontend components have been updated to support the DynamoDB structure:

1. **Data Transformation**:

   - `transformPatientToDynamo()` - Transforms frontend patient data to DynamoDB format
   - `transformPatientFromDynamo()` - Transforms DynamoDB data to frontend format

2. **Null/Undefined Safety**:

   - All components include null checks and fallbacks
   - Optional chaining (`?.`) is used to safely access nested properties
   - Default values are provided using the `||` operator

3. **Key Preservation**:
   - DynamoDB key fields (PK, SK, GSI1PK, etc.) are preserved during updates
   - New records are assigned the correct key structure

## Testing

A utility for testing DynamoDB compatibility is available at `src/utils/dynamoDbDataCheck.js`. You can use this to test components with different DynamoDB data structures.

### Example Usage

```javascript
import { runAllTests } from "./utils/dynamoDbDataCheck";
import YourComponent from "./path/to/YourComponent";

// Run the tests
runAllTests(YourComponent);
```

## Testing DynamoDB Integration

### Automated Testing

1. Run the integration test script:

```bash
cd /Users/sengngor/Desktop/App/Clinnet-EMR/frontend
./scripts/test-dynamodb.sh
```

This script checks:

- All required files are present
- Transformation functions exist in the patients service
- Mock data includes DynamoDB structure
- Components have null safety checks

### Manual Testing in Browser Console

We've provided a utility to test components directly in the browser console:

1. Start the frontend app: `npm run dev`
2. Open the browser console (F12 or Cmd+Option+I on Mac)
3. Import the test utility:

```javascript
import("./src/utils/dynamoDbDataCheck.js").then(
  (m) => (window.dynamoDbTest = m)
);
```

4. Import the component you want to test:

```javascript
import("./src/features/patients/components/PatientDetailView.jsx").then(
  (m) => (window.PatientDetailView = m.default)
);
```

5. Run the tests:

```javascript
dynamoDbTest.runAllTests(PatientDetailView);
```

### Key Components to Test

These components have been updated to handle the DynamoDB structure:

1. Patient listing & detail views

   - `PatientList.jsx` - Table with patient data
   - `PatientDetailView.jsx` - Patient detail component
   - `PatientDetailPage.jsx` - Full patient page with tabs

2. Appointments & scheduling

   - `AppointmentsTab.jsx` - Patient appointments tab
   - `WalkInFormModal.jsx` - New walk-in patient form

3. Billing components

   - `PatientCheckout.jsx` - Patient checkout form
   - `BillingHistory.jsx` - Billing history display

4. Medical records components
   - `MedicalInfoTab.jsx` - Medical info tab
   - `MedicalRecordsTab.jsx` - Medical records tab

## Troubleshooting DynamoDB Integration

If you encounter issues:

1. **Rendering errors**:

   - Check for null checks in component rendering
   - Use optional chaining (`?.`) for nested properties
   - Provide fallback values (`||`) for potentially missing data

2. **API errors**:

   - Verify transformation functions correctly map data
   - Check the browser console for specific error messages
   - Test with mock data to isolate frontend vs backend issues

3. **Missing fields**:
   - Some fields may have different names in DynamoDB
   - Use transformation functions to handle field mapping
   - Check the docuentation for the expected field structure

## Developer Guide

For a comprehensive guide with code examples on working with the DynamoDB data structure, see the [Developer Guide](./docs/dynamodb-guide.md).

The developer guide includes:

- Code examples for creating and updating patients
- Rendering patterns for DynamoDB data
- Access patterns for common tasks
- Debugging utilities

## Fallback Strategy

If the API fails to return data, the application will fall back to mock data that has been updated to include the DynamoDB structure.
