#!/bin/bash
# Test script for DynamoDB integration in the frontend
# Run this script to check if the frontend properly handles DynamoDB data structure

echo "=== Clinnet-EMR DynamoDB Integration Test ==="
echo "This script will verify that the frontend components handle the DynamoDB data structure correctly."
echo ""

# Check that the frontend is running
echo "Checking if frontend is running..."
curl -s http://localhost:5173 > /dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: Frontend does not appear to be running. Start it with 'npm run dev' first."
  exit 1
fi
echo "✅ Frontend is running"
echo ""

# List of key files that have been modified for DynamoDB support
DYNAMO_FILES=(
  "src/services/patients.js"
  "src/app/providers/DataProvider.jsx"
  "src/features/patients/components/PatientList.jsx"
  "src/features/patients/components/PatientDetailView.jsx"
  "src/features/patients/components/PatientVisitSummary.jsx"
  "src/features/billing/components/PatientCheckout.jsx"
  "src/features/billing/components/BillingHistory.jsx"
  "src/features/appointments/components/WalkInFormModal.jsx"
  "src/pages/PatientDetailPage.jsx"
  "src/components/patients/PersonalInfoTab.jsx"
  "src/components/patients/MedicalInfoTab.jsx"
  "src/components/patients/AppointmentsTab.jsx"
  "src/components/patients/MedicalRecordsTab.jsx"
  "src/mock/mockPatients.js"
  "src/utils/dynamoDbDataCheck.js"
)

# Check that all required files exist
echo "Checking for required DynamoDB-compatible files..."
for file in "${DYNAMO_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing file: $file"
  else
    echo "✅ Found file: $file"
  fi
done
echo ""

# Check for DynamoDB structure in patients.js
echo "Checking for DynamoDB transformation functions..."
grep -q "transformPatientToDynamo" src/services/patients.js
if [ $? -eq 0 ]; then
  echo "✅ Found transformPatientToDynamo function"
else
  echo "❌ Missing transformPatientToDynamo function"
fi

grep -q "transformPatientFromDynamo" src/services/patients.js
if [ $? -eq 0 ]; then
  echo "✅ Found transformPatientFromDynamo function"
else
  echo "❌ Missing transformPatientFromDynamo function"
fi
echo ""

# Check for DynamoDB fields in mock data
echo "Checking mock data for DynamoDB structure..."
grep -q "PK:" src/mock/mockPatients.js
if [ $? -eq 0 ]; then
  echo "✅ Mock data includes DynamoDB PK field"
else
  echo "❌ Mock data is missing DynamoDB PK field"
fi
echo ""

# Check for null checks in components
echo "Checking components for null safety checks..."
CHECK_FILES=(
  "src/features/patients/components/PatientDetailView.jsx"
  "src/features/patients/components/PatientVisitSummary.jsx"
  "src/components/patients/AppointmentsTab.jsx"
  "src/components/patients/MedicalRecordsTab.jsx"
)

for file in "${CHECK_FILES[@]}"; do
  grep -q "if (!patient)" "$file" || grep -q "if (!patientId)" "$file" || grep -q "patient?." "$file"
  if [ $? -eq 0 ]; then
    echo "✅ $file includes null safety checks"
  else
    echo "❌ $file may be missing null safety checks"
  fi
done
echo ""

echo "Testing complete! Review any errors above."
echo ""
echo "For detailed frontend component testing, use the dynamoDbDataCheck.js utility in the browser console:"
echo "  1. Open your browser console in the running application"
echo "  2. Run: import('./src/utils/dynamoDbDataCheck.js').then(m => window.dynamoDbTest = m)"
echo "  3. Test a component: dynamoDbTest.runAllTests(YourComponent)"
echo ""
echo "Example for PatientDetailView:"
echo "  import('./src/features/patients/components/PatientDetailView.jsx').then(m => window.PatientDetailView = m.default)"
echo "  dynamoDbTest.runAllTests(PatientDetailView)"
echo ""
