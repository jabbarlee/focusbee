# FocusBee Database Setup

This document explains how the FocusBee application integrates Firebase Authentication with Supabase database.

## Architecture Overview

- **Firebase Authentication**: Handles user authentication (signup, signin, password reset)
- **Supabase Database**: Stores user data and focus session information
- **Sync Layer**: Ensures Firebase users are properly synced to Supabase database

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  uid TEXT PRIMARY KEY,         -- Firebase UID
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT REFERENCES users(uid) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  focus_mode focus_mode,
  status session_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Enums

```sql
CREATE TYPE focus_mode AS ENUM ('quick-buzz', 'honey-flow', 'deep-nectar');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'cancelled');
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup Steps

1. **Create Supabase Project**

   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Schema**

   - In your Supabase SQL editor, run the schema from `src/lib/db/schema.sql`

3. **Configure Environment Variables**
   - Add your Supabase credentials to `.env.local`

## Usage

### User Operations

```typescript
import { createUser, getUserByUid, updateUser } from "@/actions/db/users";

// Create a new user (automatically called during signup)
const result = await createUser({
  uid: "firebase-uid",
  email: "user@example.com",
  name: "John Doe",
});

// Get user by Firebase UID
const user = await getUserByUid("firebase-uid");

// Update user information
const updated = await updateUser("firebase-uid", {
  name: "New Name",
});
```

### Session Operations

```typescript
import {
  createSession,
  getSessionById,
  getUserSessions,
  completeSession,
  getUserStats,
} from "@/actions/db/sessions";

// Create a new focus session
const session = await createSession({
  uid: "firebase-uid",
  focus_mode: "honey-flow",
});

// Get user's sessions
const sessions = await getUserSessions("firebase-uid", {
  limit: 10,
  status: "completed",
});

// Complete a session
await completeSession(session.data.id);

// Get user statistics
const stats = await getUserStats("firebase-uid");
```

### Authentication Integration

The authentication flow automatically syncs users to the database:

```typescript
import { signUpWithEmail, signInWithEmail } from "@/actions/auth";

// Signup automatically creates user in database
const result = await signUpWithEmail(
  "John Doe",
  "john@example.com",
  "password"
);

// Signin ensures user exists in database
const signin = await signInWithEmail("john@example.com", "password");
```

## Error Handling

All database functions return a consistent `DatabaseResult` type:

```typescript
interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

Always check the `success` field before using `data`:

```typescript
const result = await getUserByUid(uid);
if (result.success && result.data) {
  // User found
  console.log(result.data.name);
} else {
  // Handle error
  console.error(result.error);
}
```

## Database Actions Overview

### Users (`/src/actions/db/users.ts`)

- `createUser(userData)` - Create new user
- `getUserByUid(uid)` - Get user by Firebase UID
- `updateUser(uid, updates)` - Update user information
- `deleteUser(uid)` - Delete user (cascades to sessions)
- `userExists(uid)` - Check if user exists
- `getOrCreateUser(userData)` - Get existing or create new user

### Sessions (`/src/actions/db/sessions.ts`)

- `createSession(sessionData)` - Create new focus session
- `getSessionById(id)` - Get session by ID
- `getUserSessions(uid, options?)` - Get user's sessions with filtering
- `updateSession(id, updates)` - Update session
- `completeSession(id, endTime?)` - Mark session as completed
- `cancelSession(id)` - Mark session as cancelled
- `getActiveSession(uid)` - Get user's active session
- `getUserStats(uid)` - Calculate user statistics

### User Stats Table

```sql
CREATE TABLE user_stats (
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
```

**Features:**

- Automatically tracks user focus statistics
- Updates when sessions are created, completed, or cancelled
- Provides aggregated data for dashboards and analytics

**User Stats Functions:**

- `createUserStats(uid)` - Create initial stats record
- `getUserStatsRecord(uid)` - Get user stats record
- `updateStatsOnSessionCreate(uid)` - Update stats when session created
- `updateStatsOnSessionComplete(session)` - Update stats when session completed
- `updateStatsOnSessionCancel(uid)` - Update stats when session cancelled
- `recalculateUserStats(uid)` - Recalculate stats from scratch

**Migration Functions:**

- `initializeAllUserStats()` - Initialize stats for existing users
- `recalculateAllUserStats()` - Recalculate stats for all users

## User Stats System

The user stats system automatically tracks user engagement and focus metrics. It integrates seamlessly with session management:

### Automatic Updates

When sessions are created, completed, or cancelled, the stats are automatically updated:

- **Session Created**: Increments `total_sessions`
- **Session Completed**: Updates `completed_sessions`, `total_focus_minutes`, `longest_session_minutes`, `average_session_minutes`, and `last_session_at`
- **Session Cancelled**: Increments `cancelled_sessions`

### Implementation Options

**1. Application-Level Updates (Current Implementation)**

- Stats updates happen in the application code
- Provides full control and error handling
- Requires consistent use across all session operations

**2. Database-Level Triggers (Optional)**

- Use the provided SQL triggers for automatic updates
- More reliable but less flexible
- Execute `/src/lib/db/user_stats_triggers.sql` to enable

### Migration for Existing Users

For existing applications, use the migration functions to initialize stats:

```bash
# Initialize stats for users without records
node scripts/migrate-user-stats.js init

# Recalculate stats for all users (fix inconsistencies)
node scripts/migrate-user-stats.js recalculate
```

## Best Practices

1. **Always handle errors** - Database operations can fail
2. **Use transactions** - For operations that modify multiple tables
3. **Validate data** - Before sending to database
4. **Log errors** - For debugging and monitoring
5. **Use types** - TypeScript provides excellent type safety

## Security

- Firebase UID is used as the primary key for users
- Row Level Security (RLS) should be enabled in Supabase
- Users can only access their own data
- Database credentials should never be exposed to the client
