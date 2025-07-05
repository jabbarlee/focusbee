/**
 * Database utilities for authentication flow
 * These functions help sync Firebase auth with Supabase database
 */

import { getOrCreateUser, getUserByUid } from "@/actions/db/users";
import type { User as FirebaseUser } from "firebase/auth";

export interface SyncResult {
  success: boolean;
  error?: string;
  userCreated?: boolean;
}

/**
 * Ensure Firebase user exists in Supabase database
 * Call this after successful Firebase authentication
 *
 * This function will:
 * 1. Check if user exists in database
 * 2. Create user if they don't exist
 * 3. Return success status and whether user was created
 */
export async function syncUserToDatabase(
  firebaseUser: FirebaseUser
): Promise<SyncResult> {
  try {
    // Check if user already exists
    const existingUserResult = await getUserByUid(firebaseUser.uid);

    if (!existingUserResult.success) {
      console.error(
        "Failed to check user existence:",
        existingUserResult.error
      );
      return {
        success: false,
        error: existingUserResult.error,
      };
    }

    // If user already exists, no need to create
    if (existingUserResult.data) {
      return {
        success: true,
        userCreated: false,
      };
    }

    // User doesn't exist, create them
    const createResult = await getOrCreateUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "Busy Bee",
    });

    if (!createResult.success) {
      console.error("Failed to sync user to database:", createResult.error);
      return {
        success: false,
        error: createResult.error,
      };
    }

    return {
      success: true,
      userCreated: true,
    };
  } catch (error) {
    console.error("Unexpected error syncing user to database:", error);
    return {
      success: false,
      error: "Failed to sync user to database",
    };
  }
}

/**
 * Check if user exists in database
 * Useful for determining if user needs to be created
 */
export async function checkUserInDatabase(uid: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    const result = await getUserByUid(uid);

    if (!result.success) {
      return {
        exists: false,
        error: result.error,
      };
    }

    return {
      exists: result.data !== null,
    };
  } catch (error) {
    console.error("Unexpected error checking user in database:", error);
    return {
      exists: false,
      error: "Failed to check user in database",
    };
  }
}

/**
 * Sync user after Firebase authentication with enhanced error handling
 * This is the recommended function to use in authentication flows
 */
export async function ensureUserInDatabase(
  firebaseUser: FirebaseUser,
  options?: {
    retryCount?: number;
    logErrors?: boolean;
  }
): Promise<SyncResult> {
  const { retryCount = 1, logErrors = true } = options || {};

  let lastError: string | undefined;

  for (let attempt = 1; attempt <= retryCount + 1; attempt++) {
    try {
      const result = await syncUserToDatabase(firebaseUser);

      if (result.success) {
        if (logErrors && result.userCreated) {
          console.log(`✅ User ${firebaseUser.uid} synced to database`);
        }
        return result;
      }

      lastError = result.error;

      if (attempt <= retryCount) {
        if (logErrors) {
          console.warn(
            `⚠️ Attempt ${attempt} failed, retrying...`,
            result.error
          );
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      if (logErrors) {
        console.error(`❌ Sync attempt ${attempt} failed:`, error);
      }
    }
  }

  return {
    success: false,
    error: lastError || "Failed to sync user after multiple attempts",
  };
}

/**
 * Validate Firebase user data before syncing
 */
export function validateFirebaseUser(user: FirebaseUser): {
  valid: boolean;
  error?: string;
} {
  if (!user.uid) {
    return { valid: false, error: "User UID is missing" };
  }

  if (!user.email) {
    return { valid: false, error: "User email is missing" };
  }

  return { valid: true };
}

/**
 * Complete user sync with validation and error handling
 * This is the most robust function for production use
 */
export async function syncUserWithValidation(
  firebaseUser: FirebaseUser
): Promise<SyncResult> {
  // Validate user data first
  const validation = validateFirebaseUser(firebaseUser);
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid user data: ${validation.error}`,
    };
  }

  // Perform sync with retry logic
  return await ensureUserInDatabase(firebaseUser, {
    retryCount: 2,
    logErrors: true,
  });
}
