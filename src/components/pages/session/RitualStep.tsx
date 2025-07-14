"use client";

import { Timer } from "lucide-react";
import { Button } from "@/components/ui";

interface RitualStepProps {
  currentStep: number;
  steps: any[];
  countdown: number | null;
  isCountdownActive: boolean;
  onStepComplete: () => void;
}

export function RitualStep({
  currentStep,
  steps,
  countdown,
  isCountdownActive,
  onStepComplete,
}: RitualStepProps) {
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Progress bar */}
        <div className="w-full bg-white/30 h-2">
          <div
            className="bg-amber-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="text-center max-w-md">
            {/* Step icon */}
            <div
              className={`w-24 h-24 bg-honey-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${step.color}`}
            >
              <step.icon size={48} className="text-white" />
            </div>

            {/* Step counter */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? "bg-amber-500" : "bg-amber-200"
                  }`}
                />
              ))}
            </div>

            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              {step.title}
            </h1>

            <p className="text-lg text-amber-700 mb-6 font-medium">
              {step.subtitle}
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
              <p className="text-amber-800 text-lg leading-relaxed">
                {step.instruction}
              </p>

              {/* Countdown display for walk away step */}
              {currentStep === 1 && isCountdownActive && countdown !== null && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-center gap-3">
                    <Timer size={20} className="text-amber-600" />
                    <p className="text-amber-800 font-semibold">
                      Please take your time walking away...
                    </p>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold text-amber-600">
                      {countdown}
                    </span>
                    <p className="text-sm text-amber-600">seconds remaining</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={onStepComplete}
              disabled={
                currentStep === 1 && (isCountdownActive || countdown !== 0)
              }
              className={`w-full py-4 px-8 text-lg shadow-lg ${
                currentStep === 1 && (isCountdownActive || countdown !== 0)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            >
              {step.action}
            </Button>

            {/* Session info */}
            <div className="mt-6 pt-6 border-t border-amber-300/30">
              <p className="text-sm text-amber-600 text-center">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
