# Authentication Database Sync Usage

This document explains how to use the `auth-db-sync.ts` module for syncing Firebase Authentication with Supabase database.

## Available Functions

### 1. `syncUserWithValidation(firebaseUser)` - **RECOMMENDED**

The most robust function for production use. Includes validation, retry logic, and comprehensive error handling.

```typescript
import { syncUserWithValidation } from "@/lib/auth-db-sync";

// In your authentication flow
const result = await syncUserWithValidation(firebaseUser);

if (result.success) {
  if (result.userCreated) {
    console.log("New user created in database");
  } else {
    console.log("User already exists in database");
  }
} else {
  console.error("Failed to sync user:", result.error);
}
```

### 2. `syncUserToDatabase(firebaseUser)` - Basic Sync

Simple function that checks if user exists and creates them if not.

```typescript
import { syncUserToDatabase } from "@/lib/auth-db-sync";

const result = await syncUserToDatabase(firebaseUser);
// Returns: { success: boolean, error?: string, userCreated?: boolean }
```

### 3. `ensureUserInDatabase(firebaseUser, options)` - With Retry Logic

Includes retry logic with exponential backoff for handling temporary failures.

```typescript
import { ensureUserInDatabase } from "@/lib/auth-db-sync";

const result = await ensureUserInDatabase(firebaseUser, {
  retryCount: 2, // Retry up to 2 times
  logErrors: true, // Log errors to console
});
```

### 4. `checkUserInDatabase(uid)` - Check Existence Only

Just checks if a user exists without creating them.

```typescript
import { checkUserInDatabase } from "@/lib/auth-db-sync";

const result = await checkUserInDatabase(firebaseUser.uid);
// Returns: { exists: boolean, error?: string }
```

### 5. `validateFirebaseUser(user)` - Validation Only

Validates Firebase user data before attempting sync.

```typescript
import { validateFirebaseUser } from "@/lib/auth-db-sync";

const validation = validateFirebaseUser(firebaseUser);
if (!validation.valid) {
  console.error("Invalid user data:", validation.error);
}
```

## Integration with Authentication Flow

### In `signUpWithEmail`:

```typescript
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });

      // Sync to database with full validation and retry logic
      const dbResult = await syncUserWithValidation(userCredential.user);

      if (!dbResult.success) {
        console.error("Database sync failed:", dbResult.error);
        // Note: Firebase auth succeeded, so we don't fail the entire operation
      }
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    // Handle Firebase auth errors
    return { success: false, message: "Signup failed" };
  }
}
```

### In `signInWithEmail`:

```typescript
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Ensure user exists in database (create if missing)
    if (userCredential.user) {
      const dbResult = await syncUserWithValidation(userCredential.user);

      if (dbResult.userCreated) {
        console.log("User was missing from database and has been created");
      }
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: "Signin failed" };
  }
}
```

## Error Handling Patterns

### 1. Non-blocking approach (Recommended for auth flows)

```typescript
try {
  const dbResult = await syncUserWithValidation(firebaseUser);
  if (!dbResult.success) {
    // Log error but don't fail the auth operation
    console.error("Database sync failed:", dbResult.error);
    // User can still proceed with Firebase auth
  }
} catch (error) {
  // Log but don't throw - Firebase auth succeeded
  console.error("Unexpected database error:", error);
}
```

### 2. Blocking approach (For critical operations)

```typescript
const dbResult = await syncUserWithValidation(firebaseUser);
if (!dbResult.success) {
  throw new Error(`Database sync failed: ${dbResult.error}`);
}
```

## Return Types

### SyncResult Interface

```typescript
interface SyncResult {
  success: boolean; // Whether the operation succeeded
  error?: string; // Error message if failed
  userCreated?: boolean; // Whether a new user was created (vs already existed)
}
```

## Best Practices

1. **Use `syncUserWithValidation`** for production authentication flows
2. **Don't fail authentication** if database sync fails - Firebase auth is the source of truth
3. **Log database errors** for monitoring and debugging
4. **Handle edge cases** like missing email or display name
5. **Use retry logic** for handling temporary database issues
6. **Validate user data** before attempting database operations

## Common Use Cases

### New User Registration

- Firebase creates the user account
- Database sync creates the user record
- `userCreated: true` indicates successful creation

### Existing User Login

- Firebase authenticates the user
- Database sync confirms user exists
- `userCreated: false` indicates user already existed

### Missing Database Record

- User exists in Firebase but not in database (data migration scenario)
- Database sync creates the missing record
- `userCreated: true` indicates the record was created during signin

## Monitoring and Debugging

The sync functions include comprehensive logging:

- ✅ Success messages for new user creation
- ⚠️ Warning messages for retry attempts
- ❌ Error messages for failures
- ℹ️ Info messages for existing users

Example console output:

```
✅ User abc123 synced to database
⚠️ Attempt 1 failed, retrying... Database connection timeout
✅ User abc123 synced to database
```
