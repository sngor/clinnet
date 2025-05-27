// backend/tests/setupTests.js
console.log('Executing setupTests.js: Setting up environment variables for Jest...');
process.env.MEDICAL_REPORTS_TABLE = 'test-medical-reports-table-from-setup';
process.env.AWS_REGION = 'us-east-1'; // Mock region, if needed by SDK initialization
console.log(`MEDICAL_REPORTS_TABLE set to: ${process.env.MEDICAL_REPORTS_TABLE}`);
