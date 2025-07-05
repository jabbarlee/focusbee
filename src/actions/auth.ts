"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/config/firebase";

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

    // Update the user's display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });
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
