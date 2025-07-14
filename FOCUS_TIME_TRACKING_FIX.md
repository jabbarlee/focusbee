# Fix: Accurate Focus Time Tracking

## Problem

The application was calculating session duration based on `start_time` and `end_time`, which included paused time. This meant that if a user paused for 4 hours during a 20-minute session, the system would record 4 hours and 20 minutes of focused time instead of the actual 20 minutes.

## Solution

Implemented accurate focus time tracking that only counts the time when the user is actually focused (timer running and not paused).

### Changes Made:

#### 1. Database Schema Changes

- **Added `actual_focus_minutes` column to `sessions` table**
- **Updated `Session` interface** to include the new field
- **Created migration script** to add the column to existing databases

#### 2. Backend Changes

- **Modified `completeSession()` function** to accept `actualFocusMinutes` parameter
- **Updated `updateStatsOnSessionComplete()`** to use `actual_focus_minutes` instead of elapsed time
- **Enhanced `recalculateUserStats()`** to prefer actual focus time over elapsed time

#### 3. Frontend Changes

- **Added focus time tracking state** in `FocusWrapper`:
  - `actualFocusedTime`: tracks total focused seconds
  - `lastResumeTime`: tracks when focus tracking started
- **Implemented tracking functions**:
  - `startFocusTracking()`: starts tracking focus time
  - `stopFocusTracking()`: stops tracking and adds to total
  - `getActualFocusedMinutes()`: calculates total focused time
- **Updated timer controls** to handle focus tracking:
  - **Start**: begins tracking when timer starts
  - **Pause**: stops tracking when paused, resumes when unpaused
  - **Break**: stops tracking during breaks, resumes after
  - **Reset**: resets tracking and starts fresh
  - **Complete**: sends actual focused time to backend

### Key Features:

1. **Accurate Time Tracking**: Only counts time when timer is actively running
2. **Pause Handling**: Paused time is not counted as focused time
3. **Break Handling**: Break time is not counted as focused time
4. **Session Completion**: Records actual focused time, not elapsed time
5. **Backward Compatibility**: Existing sessions fall back to elapsed time calculation

### Files Modified:

- `/src/lib/db/schema.sql`
- `/src/types/dbSchema.ts`
- `/src/actions/db/sessions.ts`
- `/src/actions/db/userStats.ts`
- `/src/components/pages/focus/FocusWrapper.tsx`
- `/src/lib/db/migration_actual_focus_time.sql` (new)

### Migration Required:

Run the migration script to add the new column to existing databases:

```sql
-- See: /src/lib/db/migration_actual_focus_time.sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS actual_focus_minutes INTEGER DEFAULT 0;
```

### Testing:

1. Start a focus session
2. Pause for several minutes
3. Resume and complete the session
4. Verify that only the actual focused time is recorded in user stats

This fix ensures that user statistics accurately reflect actual focused time, providing more meaningful insights into productivity and focus patterns.
