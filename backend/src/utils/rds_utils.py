"""
RDS utilities for Aurora Serverless v2 MySQL connection
Optimized for Lambda functions with connection pooling
"""
import os
import json
import logging
import pymysql
from typing import Dict, List, Optional, Any, Tuple
from contextlib import contextmanager
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Connection pool configuration
CONNECTION_POOL = {}
MAX_CONNECTIONS = 5

class DatabaseConfig:
    """Database configuration from environment variables"""
    
    def __init__(self):
        self.host = os.environ.get('DB_HOST')
        self.port = int(os.environ.get('DB_PORT', 3306))
        self.database = os.environ.get('DB_NAME', 'clinnet_emr')
        self.username = os.environ.get('DB_USERNAME')
        self.password = os.environ.get('DB_PASSWORD')
        self.region = os.environ.get('AWS_REGION', 'us-west-2')
        
        if not all([self.host, self.username, self.password]):
            raise ValueError("Missing required database configuration")

@contextmanager
def get_db_connection():
    """
    Context manager for database connections with automatic cleanup
    """
    config = DatabaseConfig()
    connection = None
    
    try:
        connection = pymysql.connect(
            host=config.host,
            port=config.port,
            user=config.username,
            password=config.password,
            database=config.database,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            connect_timeout=10,
            read_timeout=10,
            write_timeout=10
        )
        yield connection
        
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Database connection error: {str(e)}")
        raise
    finally:
        if connection:
            connection.close()

def execute_query(query: str, params: Optional[Tuple] = None, fetch_one: bool = False) -> Optional[Any]:
    """
    Execute a SELECT query and return results
    
    Args:
        query: SQL query string
        params: Query parameters
        fetch_one: If True, return only first result
        
    Returns:
        Query results or None
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                
                if fetch_one:
                    return cursor.fetchone()
                else:
                    return cursor.fetchall()
                    
    except Exception as e:
        logger.error(f"Query execution error: {str(e)}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise

def execute_mutation(query: str, params: Optional[Tuple] = None) -> int:
    """
    Execute an INSERT, UPDATE, or DELETE query
    
    Args:
        query: SQL query string
        params: Query parameters
        
    Returns:
        Number of affected rows
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                affected_rows = cursor.execute(query, params or ())
                conn.commit()
                return affected_rows
                
    except Exception as e:
        logger.error(f"Mutation execution error: {str(e)}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise

def execute_transaction(queries: List[Tuple[str, Optional[Tuple]]]) -> bool:
    """
    Execute multiple queries in a transaction
    
    Args:
        queries: List of (query, params) tuples
        
    Returns:
        True if successful, raises exception on failure
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                for query, params in queries:
                    cursor.execute(query, params or ())
                conn.commit()
                return True
                
    except Exception as e:
        logger.error(f"Transaction execution error: {str(e)}")
        raise

# Specific utility functions for common operations

def get_patient_by_id(patient_id: str) -> Optional[Dict]:
    """Get patient by ID"""
    query = """
        SELECT p.*, 
               COUNT(DISTINCT a.id) as total_appointments,
               COUNT(DISTINCT mr.id) as total_reports,
               MAX(a.appointment_date) as last_appointment_date
        FROM patients p
        LEFT JOIN appointments a ON p.id = a.patient_id
        LEFT JOIN medical_reports mr ON p.id = mr.patient_id
        WHERE p.id = %s
        GROUP BY p.id
    """
    return execute_query(query, (patient_id,), fetch_one=True)

def get_patients_paginated(limit: int = 50, offset: int = 0, search: str = None) -> List[Dict]:
    """Get patients with pagination and optional search"""
    base_query = """
        SELECT p.id, p.first_name, p.last_name, p.email, p.phone, 
               p.date_of_birth, p.gender, p.created_at,
               COUNT(DISTINCT a.id) as total_appointments
        FROM patients p
        LEFT JOIN appointments a ON p.id = a.patient_id
    """
    
    if search:
        base_query += """
            WHERE (p.first_name LIKE %s OR p.last_name LIKE %s OR p.email LIKE %s)
        """
        search_param = f"%{search}%"
        params = (search_param, search_param, search_param, limit, offset)
    else:
        params = (limit, offset)
    
    base_query += """
        GROUP BY p.id
        ORDER BY p.last_name, p.first_name
        LIMIT %s OFFSET %s
    """
    
    return execute_query(base_query, params)

def create_patient(patient_data: Dict) -> str:
    """Create a new patient"""
    import uuid
    patient_id = str(uuid.uuid4())
    
    query = """
        INSERT INTO patients (
            id, first_name, last_name, email, phone, date_of_birth,
            gender, address, emergency_contact_name, emergency_contact_phone,
            medical_history, allergies, current_medications,
            insurance_provider, insurance_policy_number, created_by
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """
    
    params = (
        patient_id,
        patient_data.get('first_name'),
        patient_data.get('last_name'),
        patient_data.get('email'),
        patient_data.get('phone'),
        patient_data.get('date_of_birth'),
        patient_data.get('gender'),
        patient_data.get('address'),
        patient_data.get('emergency_contact_name'),
        patient_data.get('emergency_contact_phone'),
        patient_data.get('medical_history'),
        patient_data.get('allergies'),
        patient_data.get('current_medications'),
        patient_data.get('insurance_provider'),
        patient_data.get('insurance_policy_number'),
        patient_data.get('created_by')
    )
    
    execute_mutation(query, params)
    return patient_id

def get_appointments_by_date_range(start_date: str, end_date: str, doctor_id: str = None) -> List[Dict]:
    """Get appointments within date range"""
    base_query = """
        SELECT a.*, 
               CONCAT(p.first_name, ' ', p.last_name) as patient_name,
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as service_name, s.duration_minutes as service_duration
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON a.doctor_id = u.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date BETWEEN %s AND %s
    """
    
    params = [start_date, end_date]
    
    if doctor_id:
        base_query += " AND a.doctor_id = %s"
        params.append(doctor_id)
    
    base_query += " ORDER BY a.appointment_date, a.appointment_time"
    
    return execute_query(base_query, tuple(params))

def get_services_active() -> List[Dict]:
    """Get all active services"""
    query = """
        SELECT id, name, description, category, price, duration_minutes
        FROM services 
        WHERE is_active = TRUE 
        ORDER BY category, name
    """
    return execute_query(query)

def create_appointment(appointment_data: Dict) -> str:
    """Create a new appointment"""
    import uuid
    appointment_id = str(uuid.uuid4())
    
    query = """
        INSERT INTO appointments (
            id, patient_id, doctor_id, service_id, appointment_date,
            appointment_time, duration_minutes, status, notes, created_by
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """
    
    params = (
        appointment_id,
        appointment_data.get('patient_id'),
        appointment_data.get('doctor_id'),
        appointment_data.get('service_id'),
        appointment_data.get('appointment_date'),
        appointment_data.get('appointment_time'),
        appointment_data.get('duration_minutes', 30),
        appointment_data.get('status', 'scheduled'),
        appointment_data.get('notes'),
        appointment_data.get('created_by')
    )
    
    execute_mutation(query, params)
    return appointment_id

def build_response(status_code: int, data: Any, message: str = None) -> Dict:
    """Build standardized API response"""
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        }
    }
    
    body = {}
    if data is not None:
        body['data'] = data
    if message:
        body['message'] = message
    
    response['body'] = json.dumps(body, default=str)  # default=str handles datetime objects
    return response

def build_error_response(status_code: int, error_message: str, details: str = None) -> Dict:
    """Build standardized error response"""
    body = {
        'error': error_message
    }
    if details:
        body['details'] = details
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }