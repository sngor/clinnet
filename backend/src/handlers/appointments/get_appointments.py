"""
Lambda function to get all appointments
"""
import os
import json
import logging
import boto3 # Added boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr # Added Key, Attr for safety, though may not be strictly needed for the new code

from backend.src.utils.db_utils import query_table, generate_response

from backend.src.utils.responser_helper import handle_exception, build_error_response
from backend.src.utils.cors import build_cors_preflight_response, add_cors_headers

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    # Assuming logger is configured elsewhere or using root logger
    # For explicit logger:
    # logger = logging.getLogger(__name__)
    # logger.setLevel(logging.INFO) # Or as configured
    logging.info("Received event: %s", json.dumps(event))
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    # --- Handle CORS preflight (OPTIONS) requests ---
    if event.get('httpMethod', '').upper() == 'OPTIONS':
        return build_cors_preflight_response(request_origin)

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        kwargs = {} # Initialize kwargs for query_table

        # GSI usage
        if 'patientId' in query_params:
            kwargs['IndexName'] = 'PatientIdIndex'
            kwargs['KeyConditionExpression'] = Key('patientId').eq(query_params['patientId'])
        elif 'doctorId' in query_params:
            kwargs['IndexName'] = 'DoctorIdIndex'
            kwargs['KeyConditionExpression'] = Key('doctorId').eq(query_params['doctorId'])

        # Building FilterExpression for remaining parameters
        filter_expressions = []
        
        # Create a mutable copy of query_params to remove keys used in GSI
        active_query_params = dict(query_params)

        if 'patientId' in active_query_params and kwargs.get('IndexName') == 'PatientIdIndex':
            del active_query_params['patientId']
        if 'doctorId' in active_query_params and kwargs.get('IndexName') == 'DoctorIdIndex':
            del active_query_params['doctorId']

        # Now build filter_expressions from active_query_params
        if 'date' in active_query_params:
            filter_expressions.append(Attr('date').eq(active_query_params['date']))
        if 'status' in active_query_params:
            filter_expressions.append(Attr('status').eq(active_query_params['status']))
        # Add other potential filterable fields here if needed
        
        if filter_expressions:
            combined_filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                combined_filter_expr = combined_filter_expr & expr
            kwargs['FilterExpression'] = combined_filter_expr

        appointments = query_table(table_name, **kwargs)

        # --- Start of Patient Name Enrichment ---
        enriched_appointments = []
        patient_records_table_name = os.environ.get('PATIENT_RECORDS_TABLE')

        if not patient_records_table_name:
            logging.warning("PATIENT_RECORDS_TABLE environment variable not set. Skipping patient name enrichment.")
            enriched_appointments = appointments # Proceed without enrichment
        else:
            try:
                dynamodb_resource = boto3.resource('dynamodb')
                patient_table = dynamodb_resource.Table(patient_records_table_name)

                for appt in appointments:
                    new_appt = appt.copy() # Work on a copy
                    patient_id_from_appt = new_appt.get('patientId')

                    if patient_id_from_appt:
                        try:
                            # Construct the key for PatientRecordsTable
                            # Assumption: patient_id_from_appt is the UUID part, e.g., "123e4567-e89b-12d3-a456-426614174000"
                            # PatientRecordsTable PK and SK are "PATIENT#<uuid>"
                            # If patient_id_from_appt already has "PATIENT#" prefix, this logic needs adjustment.
                            # For now, assuming it's just the UUID.
                            if not patient_id_from_appt.startswith("PATIENT#"):
                                pk_value = f"PATIENT#{patient_id_from_appt}"
                            else:
                                pk_value = patient_id_from_appt

                            key_for_patient = {'PK': pk_value, 'SK': pk_value}

                            patient_response = patient_table.get_item(Key=key_for_patient)
                            patient_item = patient_response.get('Item')

                            if patient_item:
                                firstName = patient_item.get('firstName', '')
                                lastName = patient_item.get('lastName', '')
                                patient_name = f"{firstName} {lastName}".strip()
                                new_appt['patientName'] = patient_name if patient_name else "Name N/A"
                            else:
                                new_appt['patientName'] = "Unknown Patient"
                                logging.warning(f"Patient record not found for patientId: {patient_id_from_appt} (Key used: {key_for_patient})")
                        except Exception as e:
                            logging.error(f"Error fetching patient details for patientId {patient_id_from_appt}: {str(e)}")
                            new_appt['patientName'] = "Error fetching name"
                    else:
                        new_appt['patientName'] = "No Patient ID"
                    enriched_appointments.append(new_appt)
            except Exception as e:
                logging.error(f"Error during patient enrichment setup (e.g. accessing table resource): {str(e)}")
                enriched_appointments = appointments # Fallback to original appointments
        # --- End of Patient Name Enrichment ---
        
        response = generate_response(200, enriched_appointments) # Use enriched data
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return handle_exception(e, request_origin)

