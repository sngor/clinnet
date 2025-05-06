#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGION=${AWS_REGION:-us-east-2}

echo "Seeding services data..."
aws dynamodb batch-write-item --request-items file://${SCRIPT_DIR}/data/services.json --region ${REGION}

echo "Seeding patients data..."
aws dynamodb batch-write-item --request-items file://${SCRIPT_DIR}/data/patients.json --region ${REGION}

echo "Seeding users data..."
aws dynamodb batch-write-item --request-items file://${SCRIPT_DIR}/data/users.json --region ${REGION}

echo "All data seeding complete!"