"""
Lambda function to update a patient in DynamoDB
"""
import os
import json
import logging
import boto3
import decimal
from datetime import datetime
from botocore.exceptions import ClientError
from src.utils.db_utils import generate_response
from src.utils.responser_helper import build_error_response, handle_exception

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /patients/{id} with DynamoDB backend
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        table_name = os.environ.get("PATIENT_RECORDS_TABLE")
        path_params = event.get('pathParameters', {})
        patient_id = path_params.get('id')
        
        if not patient_id:
            return build_error_response(400, "Validation Error", "Patient ID is required")

        if not event.get('body'):
            return build_error_response(400, "Validation Error", "Request body is required")

        body = json.loads(event['body'])
        
        # Define fields that can be updated
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'gender', 'address', 'emergency_contact_name', 'emergency_contact_phone',
            'medical_history', 'allergies', 'current_medications',
            'insurance_provider', 'insurance_policy_number'
        ]
        
        # Construct the update expression
        update_expression_parts = []
        expression_attribute_values = {}
        expression_attribute_names = {}

        for field, value in body.items():
            if field in updatable_fields:
                expression_placeholder = f":{field}"
                attribute_name_placeholder = f"#{field}"
                update_expression_parts.append(f"{attribute_name_placeholder} = {expression_placeholder}")

                # Convert numbers to Decimal for DynamoDB
                if isinstance(value, (int, float)):
                    expression_attribute_values[expression_placeholder] = decimal.Decimal(str(value))
                else:
                    expression_attribute_values[expression_placeholder] = value

                expression_attribute_names[attribute_name_placeholder] = field

        if not update_expression_parts:
            return build_error_response(400, "Validation Error", "No valid fields to update")

        # Add updatedAt timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        update_expression_parts.append("#updatedAt = :updatedAt")
        expression_attribute_names["#updatedAt"] = "updatedAt"
        expression_attribute_values[":updatedAt"] = timestamp
        
        update_expression = "SET " + ", ".join(update_expression_parts)

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(table_name)
        
        key = {
            'PK': f'PATIENT#{patient_id}',
            'SK': 'METADATA'
        }
        
        # Update the item and return the new values
        response = table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ConditionExpression='attribute_exists(PK)', # Ensure patient exists
            ReturnValues='ALL_NEW'
        )
        
        updated_patient = response.get('Attributes', {})
        
        logger.info(f"Successfully updated patient: {patient_id}")
        return generate_response(200, updated_patient)
        
    except ClientError as e:
        # handle_exception will map ConditionalCheckFailedException to a 404
        return handle_exception(e)
    except json.JSONDecodeError:
        return build_error_response(400, "Bad Request", "Invalid JSON format")
    except Exception as e:
        logger.error(f"Error updating patient: {str(e)}", exc_info=True)
        return build_error_response(500, "Internal Server Error", "Failed to update patient")