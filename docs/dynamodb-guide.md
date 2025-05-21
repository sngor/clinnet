# 🗄️ DynamoDB Guide for Clinnet-EMR

A comprehensive guide for developers working with DynamoDB in Clinnet-EMR, including structure, best practices, and practical examples.

---

## 🏗️ Overview & Best Practices

- **Single-table design:** All entities (patients, appointments, records, billing, services) share one table.
- **Consistent key prefixes:** Use `PAT#`, `APPT#`, `RECORD#`, etc.
- **ISO timestamps:** Always use `new Date().toISOString()` for `createdAt` and `updatedAt`.
- **Related items:** Store all related items (e.g., records, appointments) under the same partition key for efficient queries.
- **GSIs:** Use Global Secondary Indexes for alternate access patterns (e.g., by clinic, by patient).
- **Access control:** Use IAM roles and Cognito for secure access.
- **Error handling:** Handle DynamoDB errors gracefully in both backend and frontend.

---

## 📋 Entity Reference Table

| Entity      | PK Example | SK Example  | Type        | Notes               |
| ----------- | ---------- | ----------- | ----------- | ------------------- |
| Patient     | PAT#123    | PROFILE#1   | PATIENT     | Main patient record |
| Appointment | PAT#123    | APPT#456    | APPOINTMENT | Linked to patient   |
| Record      | PAT#123    | RECORD#789  | RECORD      | Medical record      |
| Billing     | PAT#123    | BILL#321    | BILLING     | Billing info        |
| Service     | PAT#123    | SERVICE#654 | SERVICE     | Service provided    |

---

## 🔑 Key & Index Structure

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

### Indexing Strategy

- **GSI1:** Query by clinic (e.g., all patients in a clinic)
- **GSI2:** Query all items for a patient (e.g., all records, appointments)

---

## 👤 Example Operations

### Creating a New Patient

```js
function createNewPatient(formData) {
  const id = `${Date.now()}`;
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
    dateOfBirth: formData.dateOfBirth,
    // ... other fields
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return patient;
}
```

### Updating a Patient

```js
function updatePatient(id, formData) {
  const updatedPatient = {
    PK: `PAT#${id}`,
    SK: "PROFILE#1",
    id: id,
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: `PAT#${id}`,
    GSI2PK: `PAT#${id}`,
    GSI2SK: "PROFILE#1",
    type: "PATIENT",
    ...formData,
    updatedAt: new Date().toISOString(),
  };
  return updatedPatient;
}
```

### Creating a Patient Record

```js
function createPatientRecord(patientId, recordData) {
  const recordId = `${Date.now()}`;
  const record = {
    PK: `PAT#${patientId}`,
    SK: `RECORD#${recordId}`,
    id: recordId,
    patientId: patientId,
    GSI1PK: "CLINIC#DEFAULT",
    // ... other fields
    ...recordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return record;
}
```

---

## 🧪 Local Testing & Development

- Use [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) or [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) for local development.
- Example: `sam local start-api` to run Lambdas locally.
- See `backend/scripts/seed_data.sh` for seeding test data.

---

## 🔒 Security & Error Handling

- Use IAM roles and Cognito for access control.
- Validate all data before writing to DynamoDB.
- Catch and handle DynamoDB errors in both backend and frontend.

---

## 📚 More Examples & References

- See [backend/src/handlers/](../../../backend/src/handlers/) for Lambda code using DynamoDB.
- For advanced patterns (batch operations, migrations), consider a separate advanced guide as the project grows.

---
