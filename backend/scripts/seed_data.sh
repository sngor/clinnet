#!/bin/bash

# Stop on error
set -e

# Get the absolute path of the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data" # Path to the data directory relative to the script

# Load environment variables from .env in the backend root if present
ENV_PATH="$(dirname "$SCRIPT_DIR")/.env"
if [ -f "$ENV_PATH" ]; then
  echo "Loading environment variables from $ENV_PATH"
  export $(grep -v '^#' "$ENV_PATH" | grep -v '^$' | xargs)
fi

# Check for required environment variables
if [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_REGION environment variable is not set."
  exit 1
fi

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: ENVIRONMENT environment variable is not set (e.g., dev, test, prod)."
  exit 1
fi

# Define table names based on environment
PATIENT_RECORDS_TABLE="clinnet-patient-records-${ENVIRONMENT}"
USERS_TABLE="clinnet-users-${ENVIRONMENT}"
SERVICES_TABLE="clinnet-services-${ENVIRONMENT}"
APPOINTMENTS_TABLE="clinnet-appointments-${ENVIRONMENT}"

echo "AWS Region: ${AWS_REGION}"
echo "Environment: ${ENVIRONMENT}"
echo "Patient Records Table: ${PATIENT_RECORDS_TABLE}"
echo "Users Table: ${USERS_TABLE}"
echo "Services Table: ${SERVICES_TABLE}"
echo "Appointments Table: ${APPOINTMENTS_TABLE}"
echo "Data Directory: ${DATA_DIR}"

# Function to create a batch write request JSON from a simple JSON array
# $1: Input JSON file path (e.g., data/seed_patients.json)
# $2: Table name
# $3: Output batch write JSON file path
prepare_batch_write_request() {
  local input_file="$1"
  local table_name="$2"
  local output_file="$3"

  if [ ! -f "$input_file" ]; then
    echo "Warning: Data file $input_file not found. Skipping seeding for $table_name."
    return
  fi

  echo "Preparing batch write request for $table_name from $input_file..."

  # Use jq to transform the simple array of items into the batch-write-item format
  # Each item in the input array is wrapped into a PutRequest
  jq --arg table "$table_name" \
    '{ ($table): [ .[] | { PutRequest: { Item: . } } ] }' "$input_file" > "$output_file"

  if [ $? -ne 0 ]; then
    echo "Error: Failed to prepare batch write request for $table_name using jq."
    # Optionally, display the problematic jq command and input file content
    # echo "jq command: jq --arg table \"$table_name\" \'{ ($table): [ .[] | { PutRequest: { Item: . } } ] }\' \"$input_file\""
    exit 1
  fi
  echo "Successfully prepared batch write request: $output_file"
}

# Prepare and seed services
SERVICES_BATCH_FILE="${DATA_DIR}/services_batch_request.json"
prepare_batch_write_request "${DATA_DIR}/seed_services.json" "$SERVICES_TABLE" "$SERVICES_BATCH_FILE"
if [ -f "$SERVICES_BATCH_FILE" ]; then
  echo "Seeding services data from ${DATA_DIR}/seed_services.json into ${SERVICES_TABLE}..."
  aws dynamodb batch-write-item --request-items "file://${SERVICES_BATCH_FILE}" --region "$AWS_REGION"
  rm "$SERVICES_BATCH_FILE"
else
  echo "Warning: $SERVICES_BATCH_FILE not found. Skipping services seeding."
fi

# Prepare and seed patients
PATIENTS_BATCH_FILE="${DATA_DIR}/patients_batch_request.json"
prepare_batch_write_request "${DATA_DIR}/seed_patients.json" "$PATIENT_RECORDS_TABLE" "$PATIENTS_BATCH_FILE"
if [ -f "$PATIENTS_BATCH_FILE" ]; then
  echo "Seeding patients data from ${DATA_DIR}/seed_patients.json into ${PATIENT_RECORDS_TABLE}..."
  aws dynamodb batch-write-item --request-items "file://${PATIENTS_BATCH_FILE}" --region "$AWS_REGION"
  rm "$PATIENTS_BATCH_FILE"
fi

# Prepare and seed appointments
# Note: Appointments also go into PatientRecordsTable if using single-table design for appointments related to patients,
# or into AppointmentsTable if it's a separate table as defined in template.yaml.
# The current mockAppointments.js has GSI2PK: "PAT#<patientId>", suggesting they might be part of PatientRecordsTable
# or link to it. For this example, I'll assume AppointmentsTable is the target for primary appointment items.
# If appointments are stored with patient records, adjust the table name and PK/SK structure accordingly.
APPOINTMENTS_BATCH_FILE="${DATA_DIR}/appointments_batch_request.json"
prepare_batch_write_request "${DATA_DIR}/seed_appointments.json" "$APPOINTMENTS_TABLE" "$APPOINTMENTS_BATCH_FILE"
if [ -f "$APPOINTMENTS_BATCH_FILE" ]; then
  echo "Seeding appointments data from ${DATA_DIR}/seed_appointments.json into ${APPOINTMENTS_TABLE}..."
  aws dynamodb batch-write-item --request-items "file://${APPOINTMENTS_BATCH_FILE}" --region "$AWS_REGION"
  rm "$APPOINTMENTS_BATCH_FILE"
fi

# Seeding users data
# Ensure ${DATA_DIR}/users.json is correctly formatted for batch-write-item.
if [ -f "${DATA_DIR}/users.json" ]; then # Corrected path to use DATA_DIR
  echo "Seeding users data from ${DATA_DIR}/users.json into ${USERS_TABLE}..."
  # Assuming users.json is already in the correct batch write format.
  aws dynamodb batch-write-item --request-items "file://${DATA_DIR}/users.json" --region "$AWS_REGION"
else
  echo "Warning: ${DATA_DIR}/users.json not found. Skipping user seeding."
fi



echo "All data seeding attempts complete!"
echo "Please check AWS console for DynamoDB table contents and any batch write errors."
