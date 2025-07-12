"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { signOutUser } from "@/actions/auth";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="relative">
      {/* Header background with sophisticated gradient */}
      <div className="bg-gradient-to-r from-yellow-50/80 via-amber-50/60 to-yellow-50/80 border-b border-yellow-200/50 backdrop-blur-sm shadow-sm px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-6">
            {/* Logo and branding */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-yellow-900 tracking-tight">
                  Focus<span className="text-amber-600">Bee</span>
                </h1>
                <p className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                  <span>Your productivity hive</span>
                </p>
              </div>
            </div>

            {/* User section and navigation */}
            <div className="flex items-center gap-3">
              {/* Navigation buttons with enhanced design language */}
              <div className="flex items-center gap-3">
                {/* Settings button */}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push("/account")}
                  title="Account Settings"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Settings</span>
                </Button>

                {/* Logout button */}
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut
                      size={18}
                      className="transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                  )}
                  <span className="hidden sm:inline">
                    {isLoggingOut ? "Buzzing away..." : "Sign Out"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
