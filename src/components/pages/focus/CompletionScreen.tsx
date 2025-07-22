"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { FocusMode } from "@/lib/data";

interface CompletionScreenProps {
  selectedTimer: FocusMode;
  wasAlreadyCompleted: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  onReset: () => void;
  onGoToDashboard: () => void;
}

export function CompletionScreen({
  selectedTimer,
  wasAlreadyCompleted,
  isAuthenticated,
  loading,
  onReset,
  onGoToDashboard,
}: CompletionScreenProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern */}
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="text-center max-w-lg">
          <div
            className={`w-32 h-32 ${
              wasAlreadyCompleted ? "bg-amber-500" : "bg-green-500"
            } rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl`}
          >
            <CheckCircle size={64} className="text-white" />
          </div>

          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            {wasAlreadyCompleted
              ? "Session Already Complete! ✨"
              : "Focus Complete! 🎉"}
          </h1>

          <p className="text-xl text-amber-800 mb-8 leading-relaxed">
            {wasAlreadyCompleted
              ? "This focus session has already been completed. Great work on staying consistent with your focus journey!"
              : `Congratulations! You've completed your ${selectedTimer?.name} session. Time to celebrate your focused work!`}
          </p>

          {selectedTimer && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${selectedTimer.color} rounded-full flex items-center justify-center`}
                >
                  <selectedTimer.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">
                    {selectedTimer.name}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {selectedTimer.duration} minutes{" "}
                    {wasAlreadyCompleted ? "session" : "completed"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            {/* Dashboard button for all authenticated users */}
            {!loading && isAuthenticated && (
              <Button
                variant="default"
                size="md"
                onClick={onGoToDashboard}
                className="min-w-48"
              >
                <Home size={20} />
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
