"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";
import { LoadingSpinner } from "./LoadingSpinner";

export function DashboardWrapper() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Honeycomb background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <DashboardHeader user={user ? {
          uid: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined
        } : null} />
        <DashboardContent user={user ? {
          uid: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined
        } : null}  />
      </div>
    </div>
  );
}
