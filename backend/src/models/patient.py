"""
Patient data models and validation schemas
"""
from typing import Optional, Dict, Any
from datetime import date, datetime
from dataclasses import dataclass
from enum import Enum

class Gender(Enum):
    """Gender enumeration"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

@dataclass
class Patient:
    """Patient data model"""
    id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @property
    def full_name(self) -> str:
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> Optional[int]:
        """Calculate patient's age"""
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert patient to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.age,
            'gender': self.gender.value if self.gender else None,
            'address': self.address,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'medical_history': self.medical_history,
            'allergies': self.allergies,
            'current_medications': self.current_medications,
            'insurance_provider': self.insurance_provider,
            'insurance_policy_number': self.insurance_policy_number,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

@dataclass
class PatientCreate:
    """Patient creation model"""
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None  # ISO format string
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    
    def validate(self) -> Dict[str, str]:
        """Validate patient creation data"""
        errors = {}
        
        # Required fields
        if not self.first_name or not self.first_name.strip():
            errors['first_name'] = "First name is required"
        
        if not self.last_name or not self.last_name.strip():
            errors['last_name'] = "Last name is required"
        
        # Email validation
        if self.email and '@' not in self.email:
            errors['email'] = "Invalid email format"
        
        # Phone validation
        if self.phone and len(self.phone.strip()) < 10:
            errors['phone'] = "Phone number must be at least 10 digits"
        
        # Date of birth validation
        if self.date_of_birth:
            try:
                dob = datetime.strptime(self.date_of_birth, '%Y-%m-%d').date()
                if dob > date.today():
                    errors['date_of_birth'] = "Date of birth cannot be in the future"
            except ValueError:
                errors['date_of_birth'] = "Invalid date format. Use YYYY-MM-DD"
        
        # Gender validation
        if self.gender and self.gender not in [g.value for g in Gender]:
            errors['gender'] = f"Gender must be one of: {', '.join([g.value for g in Gender])}"
        
        return errors

@dataclass
class PatientUpdate:
    """Patient update model"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    
    def validate(self) -> Dict[str, str]:
        """Validate patient update data"""
        errors = {}
        
        # Email validation (if provided)
        if self.email is not None and self.email and '@' not in self.email:
            errors['email'] = "Invalid email format"
        
        # Phone validation (if provided)
        if self.phone is not None and self.phone and len(self.phone.strip()) < 10:
            errors['phone'] = "Phone number must be at least 10 digits"
        
        # Date of birth validation (if provided)
        if self.date_of_birth is not None and self.date_of_birth:
            try:
                dob = datetime.strptime(self.date_of_birth, '%Y-%m-%d').date()
                if dob > date.today():
                    errors['date_of_birth'] = "Date of birth cannot be in the future"
            except ValueError:
                errors['date_of_birth'] = "Invalid date format. Use YYYY-MM-DD"
        
        # Gender validation (if provided)
        if self.gender is not None and self.gender and self.gender not in [g.value for g in Gender]:
            errors['gender'] = f"Gender must be one of: {', '.join([g.value for g in Gender])}"
        
        return errors

@dataclass
class PatientSummary:
    """Patient summary for list views"""
    id: str
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    total_appointments: int = 0
    last_appointment_date: Optional[date] = None
    
    @property
    def full_name(self) -> str:
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'age': self.age,
            'gender': self.gender,
            'total_appointments': self.total_appointments,
            'last_appointment_date': self.last_appointment_date.isoformat() if self.last_appointment_date else None
        }