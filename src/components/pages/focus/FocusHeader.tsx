"use client";

import { useRouter } from "next/navigation";
import { Home, Star } from "lucide-react";
import { Button } from "@/components/ui";

interface FocusHeaderProps {
  sessionId: string;
  isAuthenticated: boolean;
  loading: boolean;
  onJoinHive: () => void;
  onGoToDashboard: () => void;
}

export function FocusHeader({
  sessionId,
  isAuthenticated,
  loading,
  onJoinHive,
  onGoToDashboard,
}: FocusHeaderProps) {
  return (
    <header className="flex items-center p-6 relative">
      {/* Left side - FocusBee logo and session info */}
      <div className="flex-1">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-amber-900">
            Focus<span className="text-amber-600">Bee</span>
          </h1>
          <p className="text-sm text-amber-700">
            Session: {sessionId?.slice(-8)}
          </p>
        </div>
      </div>

      {/* Right side - Navigation */}
      <div className="flex-1 flex justify-end">
        {/* Conditional navigation */}
        {!loading && (
          <>
            {isAuthenticated ? (
              <Button variant="default" size="md" onClick={onGoToDashboard}>
                <Home size={20} />
                Dashboard
              </Button>
            ) : (
              <Button variant="default" size="md" onClick={onJoinHive}>
                <Star size={20} />
                Join Hive
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
