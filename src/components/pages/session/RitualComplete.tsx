"use client";

import { CheckCircle, Target } from "lucide-react";
import { FocusMode } from "@/lib/data";

interface RitualCompleteProps {
  sessionId: string;
  selectedTimer: string | null;
  timerOptions: FocusMode[];
}

export function RitualComplete({
  sessionId,
  selectedTimer,
  timerOptions,
}: RitualCompleteProps) {
  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
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
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={48} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Focus Zone Active!
          </h1>

          <p className="text-lg text-amber-800 mb-8 leading-relaxed">
            Perfect! Your phone is safely away from your workspace. Now go
            create something amazing!
          </p>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <Target size={20} className="text-amber-700" />
              <p className="text-amber-700 font-medium">
                Your focus session is now active
              </p>
            </div>

            {(() => {
              const timer = timerOptions.find((t) => t.id === selectedTimer);
              if (!timer) return null;
              return (
                <div className="flex items-center gap-3 mb-3 p-3 bg-amber-50 rounded-lg">
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${timer.color} rounded-full flex items-center justify-center`}
                  >
                    <timer.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-semibold">{timer.name}</p>
                    <p className="text-sm text-amber-600">
                      {timer.duration} minutes of focused work ahead
                    </p>
                  </div>
                </div>
              );
            })()}

            <p className="text-sm text-amber-600">
              Your phone will stay where you left it as a gentle reminder of
              your commitment to focus. The timer is now running on your laptop!
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-green-800 font-semibold text-sm">
                Ritual Complete!
              </p>
            </div>
            <p className="text-green-700 text-sm">
              🎯 Return to your laptop to see your focus timer in action. Your
              phone can stay here until the session ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
