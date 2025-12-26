-- PostgreSQL Database Setup for MVTPS
-- Run these commands in PostgreSQL as superuser

-- Create database
CREATE DATABASE mvtps_db;

-- Create user
CREATE USER mvtps_user WITH PASSWORD 'mvtps_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mvtps_db TO mvtps_user;

-- Connect to the database
\c mvtps_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO mvtps_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mvtps_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mvtps_user;