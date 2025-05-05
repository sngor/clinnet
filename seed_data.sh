#!/bin/bash

echo "Seeding services data..."
aws dynamodb batch-write-item --request-items file:///Users/sengngor/Desktop/App/Clinnet-EMR/data/services.json --region us-east-2

echo "Seeding patients data..."
aws dynamodb batch-write-item --request-items file:///Users/sengngor/Desktop/App/Clinnet-EMR/data/patients.json --region us-east-2

echo "Seeding users data..."
aws dynamodb batch-write-item --request-items file:///Users/sengngor/Desktop/App/Clinnet-EMR/data/users.json --region us-east-2

echo "All data seeding complete!"
