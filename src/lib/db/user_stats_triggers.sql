-- Database Triggers for Automatic User Stats Updates
-- These triggers will automatically update user_stats when sessions are created/updated
--
-- CRITICAL DATA INTEGRITY RULE:
-- - Focus time must ONLY be calculated from the actual_focus_minutes field
-- - NEVER calculate time from start_time/end_time difference
-- - Only sessions with actual_focus_minutes > 0 count as completed
-- - The user_stats table is the single source of truth for dashboard data

-- Function to update user stats when sessions change
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_uid TEXT;
    total_mins INTEGER;
    completed_count INTEGER;
    cancelled_count INTEGER;
    total_count INTEGER;
    longest_mins INTEGER;
    avg_mins INTEGER;
    last_session_time TIMESTAMPTZ;
BEGIN
    -- Get the user ID from the session
    IF TG_OP = 'DELETE' THEN
        user_uid := OLD.uid;
    ELSE
        user_uid := NEW.uid;
    END IF;

    -- Calculate statistics from all sessions for this user
    -- STRICT RULE: Only use actual_focus_minutes, never calculate from start_time/end_time
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN s.status = 'completed' AND s.actual_focus_minutes > 0 THEN s.actual_focus_minutes
                ELSE 0 
            END
        ), 0),
        COALESCE(COUNT(*) FILTER (WHERE s.status = 'completed' AND s.actual_focus_minutes > 0), 0),
        COALESCE(COUNT(*) FILTER (WHERE s.status = 'cancelled'), 0),
        COALESCE(COUNT(*), 0),
        COALESCE(MAX(
            CASE 
                WHEN s.status = 'completed' AND s.actual_focus_minutes > 0 THEN s.actual_focus_minutes
                ELSE 0 
            END
        ), 0),
        COALESCE(MAX(s.end_time) FILTER (WHERE s.status = 'completed' AND s.actual_focus_minutes > 0), NULL)
    INTO 
        total_mins, 
        completed_count, 
        cancelled_count, 
        total_count, 
        longest_mins,
        last_session_time
    FROM sessions s 
    WHERE s.uid = user_uid;

    -- Calculate average (avoid division by zero)
    IF completed_count > 0 THEN
        avg_mins := ROUND(total_mins / completed_count);
    ELSE
        avg_mins := 0;
    END IF;

    -- Update or insert user stats
    INSERT INTO user_stats (
        uid,
        total_focus_minutes,
        total_sessions,
        completed_sessions,
        cancelled_sessions,
        last_session_at,
        longest_session_minutes,
        average_session_minutes,
        created_at,
        updated_at
    ) VALUES (
        user_uid,
        total_mins,
        total_count,
        completed_count,
        cancelled_count,
        last_session_time,
        longest_mins,
        avg_mins,
        NOW(),
        NOW()
    )
    ON CONFLICT (uid) 
    DO UPDATE SET
        total_focus_minutes = EXCLUDED.total_focus_minutes,
        total_sessions = EXCLUDED.total_sessions,
        completed_sessions = EXCLUDED.completed_sessions,
        cancelled_sessions = EXCLUDED.cancelled_sessions,
        last_session_at = EXCLUDED.last_session_at,
        longest_session_minutes = EXCLUDED.longest_session_minutes,
        average_session_minutes = EXCLUDED.average_session_minutes,
        updated_at = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_insert ON sessions;
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_update ON sessions;
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_delete ON sessions;

CREATE TRIGGER trigger_update_user_stats_on_insert
    AFTER INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_on_update
    AFTER UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_on_delete
    AFTER DELETE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Initialize user_stats for existing users (run once)
-- This will create stats records for all existing users
INSERT INTO user_stats (uid, created_at, updated_at)
SELECT u.uid, NOW(), NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_stats us WHERE us.uid = u.uid
)
ON CONFLICT (uid) DO NOTHING;

-- Trigger the recalculation for all existing users
-- This will populate the stats with actual data from sessions
UPDATE sessions SET updated_at = updated_at WHERE id IS NOT NULL;
