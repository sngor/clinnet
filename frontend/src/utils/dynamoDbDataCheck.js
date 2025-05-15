// src/utils/dynamoDbDataCheck.js
// Utility to verify component compatibility with DynamoDB patient data

// Sample DynamoDB patient record for testing
export const sampleDynamoDbPatient = {
  PK: "PAT#12345",
  SK: "PROFILE#1",
  id: "12345",
  GSI1PK: "CLINIC#DEFAULT",
  GSI1SK: "PAT#12345",
  GSI2PK: "PAT#12345",
  GSI2SK: "PROFILE#1",
  type: "PATIENT",
  firstName: "Jane",
  lastName: "Smith",
  dob: "1985-05-15",
  phone: "+1 (555) 123-4567",
  email: "jane.smith@example.com",
  address: "123 Main St, Anytown, CA 12345",
  insuranceProvider: "Blue Cross",
  insuranceNumber: "BC12345678",
  status: "Active",
  createdAt: "2023-01-15T08:30:00Z",
  updatedAt: "2023-05-10T14:22:00Z"
};

// Minimal DynamoDB patient record
export const minimalDynamoDbPatient = {
  PK: "PAT#67890",
  SK: "PROFILE#1",
  id: "67890",
  type: "PATIENT",
  firstName: "John",
  lastName: "Doe"
};

// Test if a component can render with DynamoDB patient data
export function testComponentWithDynamoDbPatient(Component, patientData) {
  try {
    const element = Component({ patient: patientData });
    console.log('Component rendered successfully with DynamoDB data');
    return true;
  } catch (error) {
    console.error('Component failed to render with DynamoDB data:', error);
    return false;
  }
}

// Test deep property access in patient data
export function testDeepAccess(obj, path) {
  try {
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    console.log(`Access to ${path}:`, value);
    return value;
  } catch (error) {
    console.error(`Error accessing ${path}:`, error);
    return undefined;
  }
}

// Run all tests for a component
export function runAllTests(Component) {
  console.group('Testing Component with DynamoDB Data');
  console.log('Testing with complete patient data...');
  const testFull = testComponentWithDynamoDbPatient(Component, sampleDynamoDbPatient);
  console.log('Testing with minimal patient data...');
  const testMinimal = testComponentWithDynamoDbPatient(Component, minimalDynamoDbPatient);
  console.log('Testing with null patient data...');
  const testNull = testComponentWithDynamoDbPatient(Component, null);
  console.log('Testing deep property access...');
  testDeepAccess(sampleDynamoDbPatient, 'address');
  testDeepAccess(sampleDynamoDbPatient, 'insuranceProvider');
  testDeepAccess(minimalDynamoDbPatient, 'address');
  console.groupEnd();
  return { testFull, testMinimal, testNull };
}

// Usage instructions
console.log(`\nDynamoDB Data Structure Test Utility\n\nUsage:\n  import { runAllTests } from './utils/dynamoDbDataCheck';\n  import YourComponent from './path/to/YourComponent';\n  runAllTests(YourComponent);\n`);
