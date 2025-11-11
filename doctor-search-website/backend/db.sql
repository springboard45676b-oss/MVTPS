CREATE DATABASE doctor_db;
USE doctor_db;

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    specialization VARCHAR(100),
    experience_years INT,
    contact_info VARCHAR(100),
    location VARCHAR(100)
);

INSERT INTO doctors (name, specialization, experience_years, contact_info, location) VALUES
('Dr. Ankur Thomas', 'Cardiologist', 10, 'ankur@example.com', 'Delhi'),
('Dr. Rajesh Kumar', 'Dermatologist', 7, 'rajesh@example.com', 'Mumbai'),
('Dr. Priya Sharma', 'Pediatrician', 5, 'priya@example.com', 'Chennai');
