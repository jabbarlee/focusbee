"use client";

import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { FocusMode } from "@/lib/data";

interface SessionStartProps {
  sessionId: string;
  selectedTimer: string | null;
  timerOptions: FocusMode[];
  onStart: () => void;
  onBackToTimerSelection: () => void;
}

export function SessionStart({
  sessionId,
  selectedTimer,
  timerOptions,
  onStart,
  onBackToTimerSelection,
}: SessionStartProps) {
  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern - lighter for mobile */}
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
          {/* Bee icon */}
          <div className="w-20 h-20 bg-honey-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Zap size={36} className="text-white" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-600">
              Session: {sessionId?.slice(-8)}
            </p>
          </div>

          <p className="text-lg text-amber-800 mb-8 leading-relaxed">
            Ready to create some distance from your phone and enter your focus
            zone?
          </p>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const timer = timerOptions.find((t) => t.id === selectedTimer);
                if (!timer) return null;
                return (
                  <>
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${timer.color} rounded-full flex items-center justify-center`}
                    >
                      <timer.icon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-amber-700 font-semibold">
                        {timer.name}
                      </p>
                      <p className="text-sm text-amber-600">
                        {timer.duration} minutes
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            <p className="text-amber-700 font-medium mb-2">
              Session ID:{" "}
              <span className="font-mono text-sm">{sessionId?.slice(-8)}</span>
            </p>
            <p className="text-sm text-amber-600">
              This session will guide you through a simple ritual to create
              physical distance from your phone.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onBackToTimerSelection}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-3"
            >
              <ArrowLeft size={20} />
              Change Timer
            </Button>

            <Button
              onClick={onStart}
              className="flex-1 py-4 px-8 text-lg shadow-lg"
            >
              Start Focus Ritual
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
