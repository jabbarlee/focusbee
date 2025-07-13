"use server";

import { supabase } from "@/lib/config/supabase";
import { User } from "@/types/dbSchema";
import { createUserStats } from "./userStats";

export interface CreateUserData {
  uid: string;
  email: string;
  name: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
}

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new user in the database
 * Called after successful Firebase authentication
 */
export async function createUser(
  userData: CreateUserData
): Promise<DatabaseResult<User>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Create initial user stats
    await createUserStats(data.uid);

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    console.error("Unexpected error creating user:", error);
    return {
      success: false,
      error: "Failed to create user in database",
    };
  }
}

/**
 * Get user by Firebase UID
 */
export async function getUserByUid(
  uid: string
): Promise<DatabaseResult<User | null>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .single();

    if (error) {
      // User not found is not an error for this function
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: null,
        };
      }

      console.error("Error fetching user:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    console.error("Unexpected error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user from database",
    };
  }
}

/**
 * Update user information
 */
export async function updateUser(
  uid: string,
  updates: UpdateUserData
): Promise<DatabaseResult<User>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("uid", uid)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    console.error("Unexpected error updating user:", error);
    return {
      success: false,
      error: "Failed to update user in database",
    };
  }
}

/**
 * Delete user from database
 * This will cascade delete all associated sessions
 */
export async function deleteUser(uid: string): Promise<DatabaseResult<void>> {
  try {
    const { error } = await supabase.from("users").delete().eq("uid", uid);

    if (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user from database",
    };
  }
}

/**
 * Check if user exists in database
 */
export async function userExists(
  uid: string
): Promise<DatabaseResult<boolean>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid")
      .eq("uid", uid)
      .single();

    if (error) {
      // User not found
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: false,
        };
      }

      console.error("Error checking user existence:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Unexpected error checking user existence:", error);
    return {
      success: false,
      error: "Failed to check user existence",
    };
  }
}

/**
 * Get or create user - useful for ensuring user exists in database
 * after Firebase authentication
 */
export async function getOrCreateUser(
  userData: CreateUserData
): Promise<DatabaseResult<User>> {
  try {
    // First, try to get the user
    const existingUserResult = await getUserByUid(userData.uid);

    if (!existingUserResult.success) {
      return existingUserResult as DatabaseResult<User>;
    }

    // If user exists, return it
    if (existingUserResult.data) {
      return {
        success: true,
        data: existingUserResult.data,
      };
    }

    // If user doesn't exist, create it
    return await createUser(userData);
  } catch (error) {
    console.error("Unexpected error in getOrCreateUser:", error);
    return {
      success: false,
      error: "Failed to get or create user",
    };
  }
}
