"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import {
  User,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Target,
  CheckCircle,
  Zap,
  Clock,
  Timer,
  Flame,
} from "lucide-react";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<string | null>(null);
  const [timerConfirmed, setTimerConfirmed] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const { playBuzz, playSuccess, playStepComplete, playQRScan } = useSounds();

  // Play welcome sound when session page loads (QR scanned)
  useEffect(() => {
    const timer = setTimeout(() => {
      playQRScan();
    }, 300);
    return () => clearTimeout(timer);
  }, [playQRScan]);

  const timerOptions = [
    {
      id: "buzz-burst",
      name: "Buzz Burst",
      duration: 20,
      description: "Quick, energetic session to power through tasks",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-600",
    },
    {
      id: "hive-hustle",
      name: "Hive Hustle",
      duration: 40,
      description: "Solid work block to build momentum and flow",
      icon: Flame,
      color: "from-orange-400 to-red-500",
      textColor: "text-orange-600",
    },
    {
      id: "deep-dive",
      name: "Deep Dive",
      duration: 90,
      description: "Long, immersive session for serious deep work",
      icon: Timer,
      color: "from-purple-400 to-indigo-500",
      textColor: "text-purple-600",
    },
  ];

  const steps = [
    {
      title: "Welcome to FocusBee!",
      subtitle: "Ready to create your focus ritual?",
      instruction: "Stand up and pick up your phone",
      action: "I'm standing",
      icon: User,
      color: "text-blue-500",
    },
    {
      title: "Great! Now walk away",
      subtitle: "Distance creates intention",
      instruction:
        "Walk to another room or at least 10 steps away from your workspace",
      action: "I've walked away",
      icon: ArrowRight,
      color: "text-green-500",
    },
    {
      title: "Perfect positioning!",
      subtitle: "Time to create separation",
      instruction:
        "Place your phone face down in this location and leave it here",
      action: "Phone is placed",
      icon: Smartphone,
      color: "text-orange-500",
    },
    {
      title: "Ritual complete!",
      subtitle: "Your focus zone is activated",
      instruction:
        "Return to your workspace. Your phone will stay here as a gentle reminder of your commitment to focus.",
      action: "Start focusing",
      icon: Target,
      color: "text-purple-500",
    },
  ];

  // Countdown effect for step 1 (walk away step)
  useEffect(() => {
    if (
      currentStep === 1 &&
      isCountdownActive &&
      countdown !== null &&
      countdown > 0
    ) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 1 && countdown === 0) {
      setIsCountdownActive(false);
      playStepComplete(); // Play sound when countdown completes
    }
  }, [currentStep, isCountdownActive, countdown, playStepComplete]);

  const handleStepComplete = () => {
    if (currentStep === 0) {
      // First step: start countdown for walk away
      setCountdown(10);
      setIsCountdownActive(true);
      playStepComplete();
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep < steps.length - 1) {
      playStepComplete();
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - play success sound
      playSuccess();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    setTimerStartTime(new Date());
    setIsStarted(true);
  };

  const handleTimerSelect = (timerId: string) => {
    setSelectedTimer(selectedTimer === timerId ? null : timerId);
  };

  const handleConfirmTimer = () => {
    setTimerConfirmed(true);
    playBuzz();
  };

  // Timer selection screen
  if (!timerConfirmed) {
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
                    onClick={() => handleTimerSelect(option.id)}
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
              <button
                onClick={handleConfirmTimer}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 shadow-lg mb-6 transform hover:scale-105"
              >
                Continue with{" "}
                {timerOptions.find((t) => t.id === selectedTimer)?.name}
              </button>
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
              <Zap size={36} className="text-white" />
            </div>

            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Focus<span className="text-amber-600">Bee</span>
            </h1>

            <p className="text-lg text-amber-800 mb-8 leading-relaxed">
              Ready to create some distance from your phone and enter your focus
              zone?
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200 mb-8">
              <div className="flex items-center gap-3 mb-3">
                {(() => {
                  const timer = timerOptions.find(
                    (t) => t.id === selectedTimer
                  );
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
                <span className="font-mono text-sm">
                  {sessionId?.slice(-8)}
                </span>
              </p>
              <p className="text-sm text-amber-600">
                This session will guide you through a simple ritual to create
                physical distance from your phone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTimerConfirmed(false)}
                className="flex items-center gap-2 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-xl transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                Change Timer
              </button>

              <button
                onClick={handleStart}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors duration-200 shadow-lg"
              >
                Start Focus Ritual
              </button>
            </div>
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
                      <p className="text-amber-800 font-semibold">
                        {timer.name}
                      </p>
                      <p className="text-sm text-amber-600">
                        {timer.duration} minutes of focused work ahead
                      </p>
                    </div>
                  </div>
                );
              })()}

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

            <button
              onClick={handleStepComplete}
              disabled={
                currentStep === 1 && (isCountdownActive || countdown === null)
              }
              className={`w-full font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 shadow-lg ${
                currentStep === 1 && (isCountdownActive || countdown === null)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white hover:scale-105"
              }`}
            >
              {currentStep === 1 && isCountdownActive
                ? "Walk away first..."
                : currentStep === 1 && countdown === 0
                ? "I've walked away ✓"
                : step.action}
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
