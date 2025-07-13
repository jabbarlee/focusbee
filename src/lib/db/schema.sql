-- DB Schemas for FocusBee

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,         -- Firebase UID
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
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

CREATE TABLE IF NOT EXISTS user_stats (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  
  total_focus_minutes INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,

  last_session_at TIMESTAMPTZ,
  longest_session_minutes INTEGER DEFAULT 0,
  average_session_minutes INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ENUMS
CREATE TYPE focus_mode AS ENUM ('quick-buzz', 'honey-flow', 'deep-nectar');

CREATE TYPE session_status AS ENUM ('active', 'completed', 'cancelled');

-- SAMPLE DATA TO PUSH