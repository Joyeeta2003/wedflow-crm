-- PostgreSQL Schema for WedFlow CRM - Packages Page
-- This file contains all table structures for the Packages functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREW TYPES TABLE (Reference data for crew roles)
-- ============================================
CREATE TABLE crew_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('shooting', 'editing', 'drone')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PACKAGES TABLE (Main package information)
-- ============================================
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    reminder_day INTEGER CHECK (reminder_day > 0),
    reminder_email_days INTEGER DEFAULT 7 CHECK (reminder_email_days > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PACKAGE DAYS TABLE (Daily crew requirements)
-- ============================================
CREATE TABLE package_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    event_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, day_number)
);

-- ============================================
-- PACKAGE DAY CREW TABLE (Crew assignments per day)
-- ============================================
CREATE TABLE package_day_crew (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_day_id UUID NOT NULL REFERENCES package_days(id) ON DELETE CASCADE,
    crew_type_id UUID NOT NULL REFERENCES crew_types(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_day_id, crew_type_id)
);

-- ============================================
-- PAYMENT SCHEDULE TABLE (Payment breakdown)
-- ============================================
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    installment_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    timing VARCHAR(100) NOT NULL,
    timing_days INTEGER,
    payment_order INTEGER NOT NULL CHECK (payment_order > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, payment_order)
);

-- ============================================
-- EDITOR PLAN TABLE (Post-production editing needs)
-- ============================================
CREATE TABLE editor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id)
);

-- ============================================
-- EDITOR PLAN ASSIGNMENTS TABLE (Editor assignments)
-- ============================================
CREATE TABLE editor_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    editor_plan_id UUID NOT NULL REFERENCES editor_plans(id) ON DELETE CASCADE,
    crew_type_id UUID NOT NULL REFERENCES crew_types(id),
    editing_type VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DELIVERABLES TABLE (What the client receives)
-- ============================================
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_package_days_package_id ON package_days(package_id);
CREATE INDEX idx_package_day_crew_package_day_id ON package_day_crew(package_day_id);
CREATE INDEX idx_payment_schedules_package_id ON payment_schedules(package_id);
CREATE INDEX idx_editor_plans_package_id ON editor_plans(package_id);
CREATE INDEX idx_editor_assignments_editor_plan_id ON editor_assignments(editor_plan_id);
CREATE INDEX idx_deliverables_package_id ON deliverables(package_id);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_types_updated_at BEFORE UPDATE ON crew_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USERS TABLE (User authentication and profiles)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'freelancer', 'admin', 'photographer', 'videographer', 'cinematographer', 'drone_operator', 'photo_editor', 'video_editor')),
    staff_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial admin accounts allowed to use OTP authentication
INSERT INTO users (email, first_name, last_name, role, is_active, is_verified)
VALUES
    ('joyeetadas597@gmail.com', 'Joyeeta', 'Das', 'admin', true, true),
    ('zackagarwal@gmail.com', 'Piyush', 'Agarwal', 'admin', true, true),
    ('preetamchakrabortty610@gmail.com', 'Preetam', NULL, 'admin', true, true),
    ('mr.pritam420@gmail.com', 'Preetam', NULL, 'admin', true, true),
    ('sahasubhankar218@gmail.com', 'Subhankar', NULL, 'admin', true, true),
    ('coatedge.cfl@gmail.com', 'coatedge', NULL, 'admin', true, true)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- ============================================
-- OTP TABLE (One-time password storage)
-- ============================================
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR AUTHENTICATION
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_otp_codes_email ON otp_codes(email);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);

-- ============================================
-- USER ACTIVITY LOG TABLE (Track user actions)
-- ============================================
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER SESSIONS TABLE (Active session management)
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR USER MANAGEMENT
-- ============================================
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================
-- TRIGGER FOR USERS UPDATED_AT
-- ============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR CREW TYPES
-- ============================================
INSERT INTO crew_types (name, category) VALUES
('Photographer', 'shooting'),
('Videographer', 'shooting'),
('Cinematographer', 'shooting'),
('Drone Operator', 'drone'),
('Photo Editor', 'editing'),
('Video Editor', 'editing');
