"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const steps = [
    {
      title: "Welcome to FocusBee! 🐝",
      subtitle: "Ready to create your focus ritual?",
      instruction: "Stand up and pick up your phone",
      action: "I'm standing",
      icon: "🚶‍♂️",
    },
    {
      title: "Great! Now walk away",
      subtitle: "Distance creates intention",
      instruction:
        "Walk to another room or at least 10 steps away from your workspace",
      action: "I've walked away",
      icon: "🚶‍♂️➡️",
    },
    {
      title: "Perfect positioning!",
      subtitle: "Time to create separation",
      instruction:
        "Place your phone face down in this location and leave it here",
      action: "Phone is placed",
      icon: "📱⬇️",
    },
    {
      title: "Ritual complete! ✨",
      subtitle: "Your focus zone is activated",
      instruction:
        "Return to your workspace. Your phone will stay here as a gentle reminder of your commitment to focus.",
      action: "Start focusing",
      icon: "🎯",
    },
  ];

  const handleStepComplete = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - could redirect or show completion
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
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
              <span className="text-3xl">🐝</span>
            </div>

            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Focus<span className="text-amber-600">Bee</span>
            </h1>

            <p className="text-lg text-amber-800 mb-8 leading-relaxed">
              Ready to create some distance from your phone and enter your focus
              zone?
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
              <p className="text-amber-700 font-medium mb-2">
                Session ID:{" "}
                <span className="font-mono text-sm">
                  {sessionId?.slice(-8)}
                </span>
              </p>
              <p className="text-sm text-amber-600">
                This session will guide you through a simple ritual to create
                physical distance from your phone.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors duration-200 shadow-lg"
            >
              Start Focus Ritual
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep >= steps.length) {
    return (
      <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
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
              <span className="text-4xl">✅</span>
            </div>

            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Focus Zone Active!
            </h1>

            <p className="text-lg text-amber-800 mb-8 leading-relaxed">
              Perfect! Your phone is safely away from your workspace. Now go
              create something amazing!
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <p className="text-amber-700 font-medium mb-2">
                🎯 Your focus session is now active
              </p>
              <p className="text-sm text-amber-600">
                Your phone will stay where you left it as a gentle reminder of
                your commitment to focus.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
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
            <div className="w-24 h-24 bg-honey-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">{step.icon}</span>
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
            </div>

            <button
              onClick={handleStepComplete}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors duration-200 shadow-lg"
            >
              {step.action}
            </button>

            {/* Session info */}
            <div className="mt-6 pt-6 border-t border-amber-300/30">
              <p className="text-sm text-amber-600">
                Step {currentStep + 1} of {steps.length} • Session:{" "}
                {sessionId?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
