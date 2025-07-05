-- DB Schemas for FocusBee

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,         -- Firebase UID
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  preferred_focus_mode TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT REFERENCES users(uid) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  focus_mode focus_mode,
  status session_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ENUMS
CREATE TYPE focus_mode AS ENUM ('quick-buzz', 'honey-flow', 'deep-nectar');

CREATE TYPE session_status AS ENUM ('active', 'completed', 'cancelled');