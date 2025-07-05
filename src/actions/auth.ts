"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/config/firebase";
import { syncUserWithValidation } from "@/lib/auth-db-sync";

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user's display name in Firebase
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user record in Supabase database
      try {
        const dbResult = await syncUserWithValidation(userCredential.user);

        if (!dbResult.success) {
          console.error("Failed to create user in database:", dbResult.error);
          // Note: We don't fail the auth here since Firebase user was created successfully
          // The user can still sign in and we'll try to create the DB record again
        } else if (dbResult.userCreated) {
          console.log("✅ New user created in database");
        } else {
          console.log("ℹ️ User already exists in database");
        }
      } catch (dbError) {
        console.error("Database error during signup:", dbError);
        // Continue with successful Firebase auth
      }
    }

    return {
      success: true,
      message: "Account created successfully! Welcome to the hive! 🐝",
      user: userCredential.user,
    };
  } catch (error: any) {
    let message = "Something went wrong. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        message =
          "This email is already part of our hive! Try signing in instead.";
        break;
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/operation-not-allowed":
        message = "Email/password accounts are not enabled.";
        break;
      case "auth/weak-password":
        message =
          "Your password needs to be stronger! Try adding more characters.";
        break;
      default:
        console.error("Signup error:", error);
    }

    return {
      success: false,
      message,
    };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Ensure user exists in database (create if missing)
    if (userCredential.user) {
      try {
        const dbResult = await syncUserWithValidation(userCredential.user);

        if (!dbResult.success) {
          console.error("Failed to ensure user in database:", dbResult.error);
          // Continue with successful Firebase auth
        } else if (dbResult.userCreated) {
          console.log("✅ User created in database during signin");
        } else {
          console.log("ℹ️ User already exists in database");
        }
      } catch (dbError) {
        console.error("Database error during signin:", dbError);
        // Continue with successful Firebase auth
      }
    }

    return {
      success: true,
      message: "Welcome back, busy bee! 🐝",
      user: userCredential.user,
    };
  } catch (error: any) {
    let message = "Something went wrong. Please try again.";

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        message = "Invalid email or password. Please check your credentials.";
        break;
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        message = "This account has been disabled. Please contact support.";
        break;
      case "auth/too-many-requests":
        message = "Too many failed attempts. Please try again later.";
        break;
      default:
        console.error("Signin error:", error);
    }

    return {
      success: false,
      message,
    };
  }
}

export async function signOutUser(): Promise<AuthResult> {
  try {
    await signOut(auth);
    return {
      success: true,
      message: "You've been signed out. Thanks for buzzing with us! 🐝",
    };
  } catch (error: any) {
    console.error("Signout error:", error);
    return {
      success: false,
      message: "Failed to sign out. Please try again.",
    };
  }
}
