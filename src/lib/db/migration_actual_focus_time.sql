-- Migration to add actual_focus_minutes column to sessions table
-- This fixes the issue where paused time was being counted as focused time

-- Add the new column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS actual_focus_minutes INTEGER DEFAULT 0;

-- Update existing sessions to use the old calculation as a fallback
-- This sets actual_focus_minutes to the elapsed time for completed sessions
UPDATE sessions 
SET actual_focus_minutes = CASE 
  WHEN status = 'completed' AND end_time IS NOT NULL AND start_time IS NOT NULL THEN 
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ELSE 0
END
WHERE actual_focus_minutes = 0;

-- For active sessions, set to 0 since they haven't been tracked yet
UPDATE sessions 
SET actual_focus_minutes = 0 
WHERE status = 'active';

-- Add comment to document the purpose
COMMENT ON COLUMN sessions.actual_focus_minutes IS 'Tracks the actual time user spent focused, excluding paused time';

-- Verify the migration
SELECT 
  status,
  COUNT(*) as count,
  AVG(actual_focus_minutes) as avg_focus_minutes,
  AVG(CASE 
    WHEN end_time IS NOT NULL AND start_time IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ELSE 0
  END) as avg_elapsed_minutes
FROM sessions 
GROUP BY status;
