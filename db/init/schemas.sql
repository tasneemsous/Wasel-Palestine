-- Initial schema for Wasel Palestine project (PostgreSQL)

-- ENUM types
CREATE TYPE report_category_enum AS ENUM ('CLOSURE','DELAY','ACCIDENT','WEATHER_HAZARD','OTHER');
CREATE TYPE report_status_enum AS ENUM ('PENDING','VERIFIED','REJECTED','DUPLICATE');
CREATE TYPE incident_type_enum AS ENUM ('CLOSURE','DELAY','ACCIDENT','WEATHER_HAZARD','OTHER');
CREATE TYPE incident_severity_enum AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');

-- USERS  
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'CITIZEN',
  reputation_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKPOINTS 
CREATE TABLE checkpoints (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location_lat DECIMAL(9,6) NOT NULL,
  location_long DECIMAL(9,6) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORTS
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
  category report_category_enum NOT NULL,
  description TEXT,
  location_lat DECIMAL(9,6) NOT NULL,
  location_long DECIMAL(9,6) NOT NULL,
  status report_status_enum DEFAULT 'PENDING',
  confidence_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INCIDENTS
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  type incident_type_enum NOT NULL,
  severity incident_severity_enum NOT NULL,
  description TEXT,
  location_lat DECIMAL(9,6) NOT NULL,
  location_long DECIMAL(9,6) NOT NULL,
  verified_by INT REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMP,
  source_report_id INT REFERENCES reports(id) ON DELETE SET NULL
);

-- REPORT VOTES
CREATE TABLE report_votes (
  id SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type SMALLINT,
  UNIQUE(report_id, user_id)
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_name VARCHAR(100),
  center_lat DECIMAL(9,6),
  center_long DECIMAL(9,6),
  radius_km DECIMAL(5,2),
  category_preference report_category_enum,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALERTS (triggered when verified incidents match subscriptions)
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  subscription_id INT REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  performed_by INT REFERENCES users(id) ON DELETE SET NULL,
  entity_name VARCHAR(50),
  entity_id INT,
  action_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKPOINT STATUS HISTORY
CREATE TABLE checkpoint_status_history (
  id SERIAL PRIMARY KEY,
  checkpoint_id INT NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  changed_by INT REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
