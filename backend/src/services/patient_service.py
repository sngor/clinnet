"""
Patient Service - Business logic for patient management
Handles all patient-related operations with proper validation and error handling
"""
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, date
from utils.rds_utils import (
    execute_query, execute_mutation, execute_transaction,
    build_response, build_error_response
)
from models.patient import Patient, PatientCreate, PatientUpdate
import logging

logger = logging.getLogger(__name__)

class PatientService:
    """Service class for patient management operations"""
    
    @staticmethod
    def get_patients(limit: int = 50, offset: int = 0, search: str = None) -> Dict[str, Any]:
        """
        Get paginated list of patients with optional search
        
        Args:
            limit: Number of records to return (max 100)
            offset: Number of records to skip
            search: Search term for name or email
            
        Returns:
            Dictionary with patients list and pagination info
        """
        try:
            # Validate parameters
            limit = min(max(1, limit), 100)  # Ensure limit is between 1 and 100
            offset = max(0, offset)  # Ensure offset is not negative
            
            # Build query
            base_query = """
                SELECT p.id, p.first_name, p.last_name, p.email, p.phone, 
                       p.date_of_birth, p.gender, p.created_at,
                       TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                       COUNT(DISTINCT a.id) as total_appointments,
                       MAX(a.appointment_date) as last_appointment_date
                FROM patients p
                LEFT JOIN appointments a ON p.id = a.patient_id AND a.status != 'cancelled'
            """
            
            params = []
            
            if search:
                base_query += """
                    WHERE (p.first_name LIKE %s OR p.last_name LIKE %s OR p.email LIKE %s)
                """
                search_param = f"%{search.strip()}%"
                params.extend([search_param, search_param, search_param])
            
            base_query += """
                GROUP BY p.id
                ORDER BY p.last_name, p.first_name
                LIMIT %s OFFSET %s
            """
            params.extend([limit, offset])
            
            # Execute query
            patients = execute_query(base_query, tuple(params))
            
            # Get total count for pagination
            count_query = "SELECT COUNT(*) as total FROM patients p"
            count_params = []
            
            if search:
                count_query += " WHERE (p.first_name LIKE %s OR p.last_name LIKE %s OR p.email LIKE %s)"
                count_params = [search_param, search_param, search_param]
            
            total_result = execute_query(count_query, tuple(count_params), fetch_one=True)
            total_count = total_result['total'] if total_result else 0
            
            return {
                'patients': patients,
                'pagination': {
                    'limit': limit,
                    'offset': offset,
                    'total': total_count,
                    'has_more': offset + len(patients) < total_count
                },
                'search': search if search else None
            }
            
        except Exception as e:
            logger.error(f"Error getting patients: {str(e)}")
            raise
    
    @staticmethod
    def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
        """
        Get patient by ID with additional statistics
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            Patient data with statistics or None if not found
        """
        try:
            query = """
                SELECT p.*, 
                       TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                       COUNT(DISTINCT a.id) as total_appointments,
                       COUNT(DISTINCT mr.id) as total_reports,
                       MAX(a.appointment_date) as last_appointment_date,
                       CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name
                FROM patients p
                LEFT JOIN appointments a ON p.id = a.patient_id
                LEFT JOIN medical_reports mr ON p.id = mr.patient_id
                LEFT JOIN users creator ON p.created_by = creator.id
                WHERE p.id = %s
                GROUP BY p.id
            """
            
            return execute_query(query, (patient_id,), fetch_one=True)
            
        except Exception as e:
            logger.error(f"Error getting patient {patient_id}: {str(e)}")
            raise
    
    @staticmethod
    def create_patient(patient_data: Dict[str, Any], created_by: str = None) -> str:
        """
        Create a new patient with validation
        
        Args:
            patient_data: Patient information
            created_by: ID of user creating the patient
            
        Returns:
            Created patient ID
        """
        try:
            # Validate required fields
            required_fields = ['first_name', 'last_name']
            for field in required_fields:
                if not patient_data.get(field, '').strip():
                    raise ValueError(f"{field.replace('_', ' ').title()} is required")
            
            # Validate email format if provided
            email = patient_data.get('email', '').strip()
            if email and '@' not in email:
                raise ValueError("Invalid email format")
            
            # Validate date of birth if provided
            dob = patient_data.get('date_of_birth')
            if dob:
                try:
                    dob_date = datetime.strptime(dob, '%Y-%m-%d').date()
                    if dob_date > date.today():
                        raise ValueError("Date of birth cannot be in the future")
                except ValueError as e:
                    if "does not match format" in str(e):
                        raise ValueError("Invalid date format. Use YYYY-MM-DD")
                    raise
            
            # Generate patient ID
            patient_id = str(uuid.uuid4())
            
            # Prepare data
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
                patient_data['first_name'].strip(),
                patient_data['last_name'].strip(),
                email or None,
                patient_data.get('phone', '').strip() or None,
                dob,
                patient_data.get('gender') or None,
                patient_data.get('address', '').strip() or None,
                patient_data.get('emergency_contact_name', '').strip() or None,
                patient_data.get('emergency_contact_phone', '').strip() or None,
                patient_data.get('medical_history', '').strip() or None,
                patient_data.get('allergies', '').strip() or None,
                patient_data.get('current_medications', '').strip() or None,
                patient_data.get('insurance_provider', '').strip() or None,
                patient_data.get('insurance_policy_number', '').strip() or None,
                created_by
            )
            
            execute_mutation(query, params)
            
            logger.info(f"Created patient {patient_id}: {patient_data['first_name']} {patient_data['last_name']}")
            return patient_id
            
        except Exception as e:
            logger.error(f"Error creating patient: {str(e)}")
            raise
    
    @staticmethod
    def update_patient(patient_id: str, patient_data: Dict[str, Any]) -> bool:
        """
        Update patient information
        
        Args:
            patient_id: Patient UUID
            patient_data: Updated patient information
            
        Returns:
            True if successful
        """
        try:
            # Check if patient exists
            existing = PatientService.get_patient_by_id(patient_id)
            if not existing:
                raise ValueError("Patient not found")
            
            # Build dynamic update query
            update_fields = []
            params = []
            
            updatable_fields = [
                'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
                'gender', 'address', 'emergency_contact_name', 'emergency_contact_phone',
                'medical_history', 'allergies', 'current_medications',
                'insurance_provider', 'insurance_policy_number'
            ]
            
            for field in updatable_fields:
                if field in patient_data:
                    value = patient_data[field]
                    if isinstance(value, str):
                        value = value.strip() or None
                    update_fields.append(f"{field} = %s")
                    params.append(value)
            
            if not update_fields:
                raise ValueError("No valid fields to update")
            
            # Add updated timestamp and patient ID
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(patient_id)
            
            query = f"""
                UPDATE patients 
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            
            affected_rows = execute_mutation(query, tuple(params))
            
            if affected_rows == 0:
                raise ValueError("Patient not found or no changes made")
            
            logger.info(f"Updated patient {patient_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating patient {patient_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_patient(patient_id: str) -> bool:
        """
        Delete patient (soft delete by marking as inactive)
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            True if successful
        """
        try:
            # Check if patient exists
            existing = PatientService.get_patient_by_id(patient_id)
            if not existing:
                raise ValueError("Patient not found")
            
            # Check for active appointments
            active_appointments_query = """
                SELECT COUNT(*) as count 
                FROM appointments 
                WHERE patient_id = %s AND status IN ('scheduled', 'confirmed') 
                AND appointment_date >= CURDATE()
            """
            
            result = execute_query(active_appointments_query, (patient_id,), fetch_one=True)
            if result and result['count'] > 0:
                raise ValueError("Cannot delete patient with active future appointments")
            
            # Delete patient (CASCADE will handle related records)
            query = "DELETE FROM patients WHERE id = %s"
            affected_rows = execute_mutation(query, (patient_id,))
            
            if affected_rows == 0:
                raise ValueError("Patient not found")
            
            logger.info(f"Deleted patient {patient_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting patient {patient_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_patient_appointments(patient_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get patient's appointment history
        
        Args:
            patient_id: Patient UUID
            limit: Number of appointments to return
            
        Returns:
            List of appointments
        """
        try:
            query = """
                SELECT a.*, 
                       CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                       s.name as service_name
                FROM appointments a
                JOIN users u ON a.doctor_id = u.id
                LEFT JOIN services s ON a.service_id = s.id
                WHERE a.patient_id = %s
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT %s
            """
            
            return execute_query(query, (patient_id, limit))
            
        except Exception as e:
            logger.error(f"Error getting appointments for patient {patient_id}: {str(e)}")
            raise