// src/utils/dynamoDbDataCheck.js
/**
 * Utility to help verify that all components can handle the DynamoDB data structure
 * This can be imported and used in the console to test various components
 */

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

// Minimal DynamoDB patient record with only required fields
export const minimalDynamoDbPatient = {
  PK: "PAT#67890",
  SK: "PROFILE#1",
  id: "67890",
  type: "PATIENT",
  firstName: "John",
  lastName: "Doe"
};

// Function to test if a component can render with DynamoDB patient data
export function testComponentWithDynamoDbPatient(Component, patientData) {
  try {
    // Render the component with the sample data
    const element = Component({ patient: patientData });
    console.log('Component rendered successfully with DynamoDB data');
    return true;
  } catch (error) {
    console.error('Component failed to render with DynamoDB data:', error);
    return false;
  }
}

// Test data access with deeply nested DynamoDB structure
export function testDeepAccess(obj, path) {
  try {
    // Path like "patient.address" or "patient.insuranceProvider"
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

// Export a test function that can be used in the console
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
  
  return {
    testFull,
    testMinimal,
    testNull
  };
}

// Usage instructions to show in the console
console.log(`
DynamoDB Data Structure Test Utility

Usage:
  import { runAllTests } from './utils/dynamoDbDataCheck';
  import YourComponent from './path/to/YourComponent';
  
  // Run the tests
  runAllTests(YourComponent);
`);
