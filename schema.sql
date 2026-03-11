CREATE TYPE user_role AS ENUM ('ADMIN', 'MODERATOR', 'CITIZEN');
CREATE TYPE incident_type AS ENUM ('CLOSURE', 'DELAY', 'ACCIDENT', 'WEATHER_HAZARD', 'OTHER');
CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE report_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'DUPLICATE');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'CITIZEN',
    reputation_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkpoints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(9,6) NOT NULL,
    location_long DECIMAL(9,6) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkpoint_status_history (
    id SERIAL PRIMARY KEY,
    checkpoint_id INT REFERENCES checkpoints(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    reason TEXT,
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
    category incident_type NOT NULL,
    description TEXT,
    location_lat DECIMAL(9,6) NOT NULL,
    location_long DECIMAL(9,6) NOT NULL,
    status report_status DEFAULT 'PENDING',
    confidence_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_votes (
    id SERIAL PRIMARY KEY,
    report_id INT REFERENCES reports(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    vote_type INT CHECK (vote_type IN (1, -1)),
    UNIQUE(report_id, user_id)
);

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    type incident_type NOT NULL,
    severity severity_level NOT NULL,
    description TEXT,
    location_lat DECIMAL(9,6) NOT NULL,
    location_long DECIMAL(9,6) NOT NULL,
    verified_by INT REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP,
    source_report_id INT REFERENCES reports(id)
);

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    area_name VARCHAR(100),
    center_lat DECIMAL(9,6),
    center_long DECIMAL(9,6),
    radius_km DECIMAL(5,2),
    category_preference incident_type,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    performed_by INT REFERENCES users(id),
    entity_name VARCHAR(50),
    entity_id INT,
    action_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);