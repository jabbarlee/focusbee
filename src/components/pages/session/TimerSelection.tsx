"use client";

import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { FocusMode } from "@/lib/data";

interface TimerSelectionProps {
  sessionId: string;
  timerOptions: FocusMode[];
  selectedTimer: string | null;
  onTimerSelect: (timerId: string) => void;
  onConfirmTimer: () => void;
}

export function TimerSelection({
  sessionId,
  timerOptions,
  selectedTimer,
  onTimerSelect,
  onConfirmTimer,
}: TimerSelectionProps) {
  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern */}
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
          {/* Timer icon */}
          <div className="w-20 h-20 bg-honey-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Clock size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Choose Your Focus Mode
          </h1>

          <p className="text-lg text-amber-800 mb-8 leading-relaxed">
            Select how long you want to focus
          </p>

          {/* Timer Options */}
          <div className="space-y-4 mb-6">
            {timerOptions.map((option) => {
              const isSelected = selectedTimer === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onTimerSelect(option.id)}
                  className={`w-full backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? "bg-white border-amber-400 ring-2 ring-amber-400/50 shadow-2xl"
                      : "bg-white/90 border-amber-200 hover:bg-white hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${
                        option.color
                      } rounded-full flex items-center justify-center ${
                        isSelected ? "scale-110" : ""
                      } transition-transform duration-200`}
                    >
                      <option.icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-1 ${
                          isSelected ? "text-amber-800" : "text-amber-900"
                        }`}
                      >
                        {option.name}
                      </h3>
                      <p className="text-sm text-amber-700 mb-2">
                        {option.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={option.textColor} />
                        <span className={`font-semibold ${option.textColor}`}>
                          {option.duration} minutes
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-amber-500">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue Button - only shows when timer is selected */}
          {selectedTimer && (
            <Button
              onClick={onConfirmTimer}
              className="w-full text-lg py-4 px-8 mb-6 transform hover:scale-105"
            >
              Continue with{" "}
              {timerOptions.find((t) => t.id === selectedTimer)?.name}
            </Button>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-amber-200">
            <p className="text-sm text-amber-600">
              Session: {sessionId?.slice(-8)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
