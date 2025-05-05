"""
Script to seed initial data into DynamoDB tables
"""
import boto3
import uuid
import json
import hashlib
from datetime import datetime

# Configure AWS SDK using the default credential provider chain
# This will use credentials from ~/.aws/credentials or environment variables
session = boto3.Session(region_name='us-east-2')
dynamodb = session.resource('dynamodb')

# Rest of your script remains the same


def hash_password(password):
    """Simple password hashing function"""
    return hashlib.sha256(password.encode()).hexdigest()

# Initial services data
initial_services = [
    {
        "name": "General Consultation",
        "description": "Standard medical consultation with a general practitioner",
        "category": "consultation",
        "price": 100.00,
        "discountPercentage": 0,
        "duration": 30,
        "active": True
    },
    {
        "name": "Specialist Consultation",
        "description": "Consultation with a medical specialist",
        "category": "consultation",
        "price": 150.00,
        "discountPercentage": 0,
        "duration": 45,
        "active": True
    },
    {
        "name": "Blood Test - Basic Panel",
        "description": "Standard blood work including CBC, metabolic panel",
        "category": "laboratory",
        "price": 75.00,
        "discountPercentage": 0,
        "duration": 15,
        "active": True
    },
    {
        "name": "X-Ray - Single View",
        "description": "Single view X-ray imaging",
        "category": "imaging",
        "price": 120.00,
        "discountPercentage": 0,
        "duration": 20,
        "active": True
    },
    {
        "name": "Annual Physical",
        "description": "Comprehensive annual physical examination",
        "category": "examination",
        "price": 200.00,
        "discountPercentage": 0,
        "duration": 60,
        "active": True
    }
]

# Initial patients data
initial_patients = [
    {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1980-05-15",
        "gender": "Male",
        "email": "john.doe@example.com",
        "phone": "555-123-4567",
        "address": "123 Main St, Anytown, USA",
        "insuranceProvider": "Blue Cross",
        "insuranceNumber": "BC12345678",
        "medicalHistory": ["Hypertension", "Type 2 Diabetes"],
        "allergies": ["Penicillin"],
        "medications": ["Metformin", "Lisinopril"]
    },
    {
        "firstName": "Jane",
        "lastName": "Smith",
        "dateOfBirth": "1975-08-22",
        "gender": "Female",
        "email": "jane.smith@example.com",
        "phone": "555-987-6543",
        "address": "456 Oak Ave, Somewhere, USA",
        "insuranceProvider": "Aetna",
        "insuranceNumber": "AE87654321",
        "medicalHistory": ["Asthma"],
        "allergies": ["Sulfa drugs", "Pollen"],
        "medications": ["Albuterol"]
    }
]

# Initial users data
initial_users = [
    {
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@clinnet.com",
        "password": "Admin123!",
        "role": "admin",
        "phone": "555-111-0000",
        "department": "Administration",
        "position": "System Administrator",
        "active": True
    },
    {
        "firstName": "Doctor",
        "lastName": "Smith",
        "email": "doctor.smith@clinnet.com",
        "password": "Doctor123!",
        "role": "doctor",
        "phone": "555-222-0000",
        "department": "Medical",
        "position": "General Practitioner",
        "active": True
    },
    {
        "firstName": "Nurse",
        "lastName": "Johnson",
        "email": "nurse.johnson@clinnet.com",
        "password": "Nurse123!",
        "role": "nurse",
        "phone": "555-333-0000",
        "department": "Medical",
        "position": "Registered Nurse",
        "active": True
    },
    {
        "firstName": "Front",
        "lastName": "Desk",
        "email": "frontdesk@clinnet.com",
        "password": "Front123!",
        "role": "receptionist",
        "phone": "555-444-0000",
        "department": "Administration",
        "position": "Receptionist",
        "active": True
    }
]

def seed_services():
    """Seed services data into DynamoDB"""
    print('Seeding services data...')
    
    table = dynamodb.Table('clinnet-services')
    timestamp = datetime.utcnow().isoformat()
    
    for service in initial_services:
        service_item = {
            'id': str(uuid.uuid4()),
            **service,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        try:
            table.put_item(Item=service_item)
            print(f"Added service: {service['name']}")
        except Exception as e:
            print(f"Error adding service {service['name']}: {e}")
    
    print('Services data seeding complete!')

def seed_patients():
    """Seed patients data into DynamoDB"""
    print('Seeding patients data...')
    
    table = dynamodb.Table('clinnet-patients')
    timestamp = datetime.utcnow().isoformat()
    
    for patient in initial_patients:
        patient_item = {
            'id': str(uuid.uuid4()),
            **patient,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        try:
            table.put_item(Item=patient_item)
            print(f"Added patient: {patient['firstName']} {patient['lastName']}")
        except Exception as e:
            print(f"Error adding patient {patient['firstName']} {patient['lastName']}: {e}")
    
    print('Patients data seeding complete!')

def seed_users():
    """Seed users data into DynamoDB"""
    print('Seeding users data...')
    
    table = dynamodb.Table('clinnet-users')
    timestamp = datetime.utcnow().isoformat()
    
    for user in initial_users:
        # Hash the password
        password = user.pop('password')
        
        user_item = {
            'id': str(uuid.uuid4()),
            **user,
            'password': hash_password(password),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        try:
            table.put_item(Item=user_item)
            print(f"Added user: {user['firstName']} {user['lastName']}")
        except Exception as e:
            print(f"Error adding user {user['firstName']} {user['lastName']}: {e}")
    
    print('Users data seeding complete!')

def seed_data():
    """Main function to seed all data"""
    try:
        seed_services()
        seed_patients()
        seed_users()
        print('All data seeding complete!')
    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == '__main__':
    seed_data()