-- Up migration: Create UTANGIN schema
-- Create custom types
CREATE TYPE agreement_status AS ENUM ('pending', 'active', 'paid', 'overdue', 'disputed');
CREATE TYPE notification_type AS ENUM ('reminder', 'confirmation', 'payment', 'escalation', 'summary');
CREATE TYPE delivery_method AS ENUM ('push', 'email', 'whatsapp');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    ktp_number VARCHAR(50) UNIQUE,
    ktp_verified BOOLEAN DEFAULT FALSE,
    selfie_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(500),
    address TEXT,
    emergency_contacts JSONB,
    reputation_score INTEGER DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Create agreements table
CREATE TABLE agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID NOT NULL REFERENCES users(id),
    borrower_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    interest_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (interest_rate >= 0 AND interest_rate <= 100),
    due_date DATE NOT NULL,
    status agreement_status DEFAULT 'pending',
    qr_code VARCHAR(255),
    lender_confirmed BOOLEAN DEFAULT FALSE,
    borrower_confirmed BOOLEAN DEFAULT FALSE,
    repayment_schedule JSONB,
    escalation_settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create obligations/line items table
CREATE TABLE obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status agreement_status DEFAULT 'pending',
    payment_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    agreement_id UUID REFERENCES agreements(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    delivery_method delivery_method NOT NULL,
    scheduled_time TIMESTAMP,
    sent_time TIMESTAMP NULL,
    escalation_level INTEGER DEFAULT 0 CHECK (escalation_level >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    rater_id UUID NOT NULL REFERENCES users(id),
    agreement_id UUID NOT NULL REFERENCES agreements(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, agreement_id)
);

-- Create identity_verifications table
CREATE TABLE identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL, -- 'KTP', 'SIM', 'PASSPORT'
    document_number VARCHAR(50) NOT NULL,
    document_image VARCHAR(500),
    selfie_image VARCHAR(500),
    verification_status verification_status DEFAULT 'pending',
    verifier_id UUID REFERENCES users(id),
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_ktp_number ON users(ktp_number);
CREATE INDEX idx_agreements_due_date ON agreements(due_date);
CREATE INDEX idx_agreements_status ON agreements(status);
CREATE INDEX idx_agreements_lender_borrower ON agreements(lender_id, borrower_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_status);
CREATE INDEX idx_notifications_scheduled_time ON notifications(scheduled_time) WHERE scheduled_time IS NOT NULL;
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Add down migration sql here
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_user_action;
DROP INDEX IF EXISTS idx_notifications_scheduled_time;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_agreements_lender_borrower;
DROP INDEX IF EXISTS idx_agreements_status;
DROP INDEX IF EXISTS idx_agreements_due_date;
DROP INDEX IF EXISTS idx_users_ktp_number;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS identity_verifications;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS obligations;
DROP TABLE IF EXISTS agreements;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS delivery_method;
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS agreement_status;