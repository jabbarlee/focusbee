"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { Session } from "@/types/dbSchema";
import { focusModes } from "@/lib/data";

interface SessionCompletedProps {
  sessionData: Session;
  sessionId: string;
}

export function SessionCompleted({
  sessionData,
  sessionId,
}: SessionCompletedProps) {
  const router = useRouter();

  const selectedTimerData = focusModes.find(
    (t) => t.id === sessionData.focus_mode
  );

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-6 gap-3 p-4 transform rotate-12 scale-150">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 border-2 border-amber-400/40 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Session Complete! ✨
          </h1>

          <p className="text-lg text-amber-800 mb-6 leading-relaxed">
            This focus session has already been completed. Great work on your
            focus journey!
          </p>

          {selectedTimerData && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-amber-200 mb-8">
              <div className="flex items-center justify-center gap-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${selectedTimerData.color} rounded-full flex items-center justify-center`}
                >
                  <selectedTimerData.icon size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">
                    {selectedTimerData.name}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {selectedTimerData.duration} minutes session
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="default"
              size="md"
              onClick={() => router.push("/dashboard")}
              className="min-w-48"
            >
              <Home size={20} />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
