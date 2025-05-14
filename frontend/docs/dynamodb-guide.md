# Developer Guide: Working with DynamoDB in Clinnet-EMR

This guide provides practical examples for working with DynamoDB data structures in the Clinnet-EMR frontend.

## DynamoDB Structure Overview

Clinnet-EMR uses a single-table design pattern with DynamoDB. This means all entity types (patients, appointments, medical records, etc.) are stored in a single table using a combination of primary keys and global secondary indexes (GSIs).

### Key Structure

Most entities follow this structure:

| Attribute | Description              | Example                                 |
| --------- | ------------------------ | --------------------------------------- |
| PK        | Partition Key            | `PAT#123` for a patient with ID 123     |
| SK        | Sort Key                 | `PROFILE#1` for a patient profile       |
| GSI1PK    | GSI Partition Key        | `CLINIC#DEFAULT` for grouping by clinic |
| GSI1SK    | GSI Sort Key             | `PAT#123` for ordering patients         |
| GSI2PK    | GSI Partition Key 2      | `PAT#123` for querying patient items    |
| GSI2SK    | GSI Sort Key 2           | `PROFILE#1` for ordering patient items  |
| id        | Entity ID without prefix | `123`                                   |
| type      | Entity type              | `PATIENT`                               |

## Working with Patient Data

### Creating a New Patient

```javascript
// Create a new patient with DynamoDB structure
function createNewPatient(formData) {
  // Generate ID
  const id = `${Date.now()}`;

  // Create DynamoDB structure
  const patient = {
    PK: `PAT#${id}`,
    SK: "PROFILE#1",
    id: id,
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: `PAT#${id}`,
    GSI2PK: `PAT#${id}`,
    GSI2SK: "PROFILE#1",
    type: "PATIENT",

    // Patient attributes from form
    firstName: formData.firstName,
    lastName: formData.lastName,
    dob: formData.dob,
    // ... other fields

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return patient;
}
```

### Updating a Patient

```javascript
// Update a patient with DynamoDB structure
function updatePatient(id, formData) {
  // Preserve DynamoDB structure
  const updatedPatient = {
    // Keep existing keys
    PK: `PAT#${id}`,
    SK: "PROFILE#1",
    id: id,
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: `PAT#${id}`,
    GSI2PK: `PAT#${id}`,
    GSI2SK: "PROFILE#1",
    type: "PATIENT",

    // Updated fields
    ...formData,

    // Update timestamp
    updatedAt: new Date().toISOString(),
  };

  return updatedPatient;
}
```

### Working with Patient Records

```javascript
// Create a medical record for a patient
function createPatientRecord(patientId, recordData) {
  const recordId = `${Date.now()}`;

  const record = {
    PK: `PAT#${patientId}`,
    SK: `RECORD#${recordId}`,
    id: recordId,
    patientId: patientId,
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: `RECORD#${recordId}`,
    GSI2PK: `PAT#${patientId}`,
    GSI2SK: `RECORD#${recordId}`,
    type: "MEDICAL_RECORD",

    // Record fields
    ...recordData,

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return record;
}
```

## Rendering Components with DynamoDB Data

### Safe Rendering Patterns

Always use these patterns when rendering DynamoDB data:

1. **Null Checking**

```jsx
{
  patient && (
    <Typography>
      {patient.firstName} {patient.lastName}
    </Typography>
  );
}
```

2. **Default Values**

```jsx
<Typography>
  {patient?.firstName || "N/A"} {patient?.lastName || ""}
</Typography>
```

3. **Optional Chaining**

```jsx
<Typography>
  {patient?.address?.street}, {patient?.address?.city}
</Typography>
```

### Access Patterns for Common Tasks

```javascript
// Get all patients for a clinic
const clinicPatients = items.filter(
  (item) => item.GSI1PK === "CLINIC#DEFAULT" && item.GSI1SK.startsWith("PAT#")
);

// Get all records for a patient
const patientRecords = items.filter(
  (item) =>
    item.GSI2PK === `PAT#${patientId}` && item.GSI2SK.startsWith("RECORD#")
);

// Get a specific patient profile
const patientProfile = items.find(
  (item) => item.PK === `PAT#${patientId}` && item.SK === "PROFILE#1"
);
```

## Debugging Utilities

Use the debug utilities in `src/utils/debugDynamoDb.js` to inspect and validate DynamoDB entities:

```javascript
import dynamoDebug from "../utils/debugDynamoDb";

// Log entity details
dynamoDebug.logDynamoEntity(patient, "PATIENT");

// Validate entity structure
const isValid = dynamoDebug.verifyDynamoStructure(patient, "PATIENT");
```

Or use the global utilities in development:

```javascript
// In browser console
window.dynamoDb.logEntity(patient);
window.dynamoDb.verify(patient, "PATIENT");
```
