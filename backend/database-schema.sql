-- Clinnet EMR Database Schema for Aurora MySQL
-- Optimized for relational data with proper foreign keys and indexes

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS clinnet_emr;
USE clinnet_emr;

-- Users table (migrated from DynamoDB)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist') NOT NULL,
    phone VARCHAR(20),
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Patients table (migrated from DynamoDB)
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (last_name, first_name),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_dob (date_of_birth),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Services table (migrated from DynamoDB)
CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_price (price),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Appointments table (migrated from DynamoDB)
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_service_id (service_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_datetime (appointment_date, appointment_time),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Medical reports metadata (keep some in RDS for relationships)
CREATE TABLE medical_reports (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36),
    title VARCHAR(300) NOT NULL,
    report_type ENUM('consultation', 'lab_result', 'imaging', 'prescription', 'discharge_summary') NOT NULL,
    report_date DATE NOT NULL,
    summary TEXT,
    -- Store detailed content in DynamoDB, keep metadata here
    dynamodb_record_id VARCHAR(100), -- Reference to DynamoDB record
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_report_date (report_date),
    INDEX idx_report_type (report_type),
    INDEX idx_dynamodb_record (dynamodb_record_id),
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Audit log for important changes
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(36),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_changed_at (changed_at),
    
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create views for common queries
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.date_of_birth,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
    p.gender,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT mr.id) as total_reports,
    MAX(a.appointment_date) as last_appointment_date
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN medical_reports mr ON p.id = mr.patient_id
GROUP BY p.id;

CREATE VIEW doctor_schedule AS
SELECT 
    u.id as doctor_id,
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    a.appointment_date,
    a.appointment_time,
    a.duration_minutes,
    CONCAT(p.first_name, ' ', p.last_name) as patient_name,
    s.name as service_name,
    a.status
FROM appointments a
JOIN users u ON a.doctor_id = u.id
JOIN patients p ON a.patient_id = p.id
LEFT JOIN services s ON a.service_id = s.id
WHERE u.role = 'doctor'
ORDER BY a.appointment_date, a.appointment_time;

-- Insert default admin user (update with actual values)
INSERT INTO users (id, email, first_name, last_name, role, is_active) 
VALUES (
    UUID(), 
    'admin@clinnet.com', 
    'System', 
    'Administrator', 
    'admin', 
    TRUE
) ON DUPLICATE KEY UPDATE email = email;

-- Insert sample services
INSERT INTO services (id, name, description, category, price, duration_minutes, is_active) VALUES
(UUID(), 'General Consultation', 'General medical consultation', 'Consultation', 100.00, 30, TRUE),
(UUID(), 'Blood Test', 'Complete blood count and basic metabolic panel', 'Laboratory', 75.00, 15, TRUE),
(UUID(), 'X-Ray', 'Digital X-ray imaging', 'Imaging', 150.00, 20, TRUE),
(UUID(), 'Physical Therapy', 'Physical therapy session', 'Therapy', 80.00, 60, TRUE),
(UUID(), 'Vaccination', 'Routine vaccination administration', 'Preventive', 50.00, 15, TRUE)
ON DUPLICATE KEY UPDATE name = name;