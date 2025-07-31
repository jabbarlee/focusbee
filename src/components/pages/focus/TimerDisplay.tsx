"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { FocusMode } from "@/lib/data";

interface TimerDisplayProps {
  selectedTimer: FocusMode;
  timeRemaining: number;
  progress: number;
  isPaused: boolean;
  isOnBreak: boolean;
  breakTimeRemaining: number;
  onPause: () => void;
  onReset: () => void;
  pauseLoading?: boolean;
  resetLoading?: boolean;
}

export function TimerDisplay({
  selectedTimer,
  timeRemaining,
  progress,
  isPaused,
  isOnBreak,
  breakTimeRemaining,
  onPause,
  onReset,
  pauseLoading = false,
  resetLoading = false,
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-center max-w-2xl w-full">
      {/* Timer mode info */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div
          className={`w-16 h-16 bg-gradient-to-r ${selectedTimer.color} rounded-full flex items-center justify-center shadow-lg`}
        >
          <selectedTimer.icon size={32} className="text-white" />
        </div>
        <div className="text-left">
          <h2 className="text-3xl font-bold text-amber-900">
            {selectedTimer.name}
          </h2>
          <p className="text-lg text-amber-700">{selectedTimer.description}</p>
        </div>
      </div>

      {/* Main and Break Timers Container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Main Timer */}
        <div
          className={`transition-all duration-500 ${
            isOnBreak
              ? "opacity-60 scale-95 transform -translate-x-16"
              : "opacity-100 scale-100 transform translate-x-0"
          }`}
        >
          <div className="relative w-96 h-96 rounded-full bg-white shadow-lg border-2 border-amber-200">
            {/* Simple circular progress ring */}
            <svg
              className="absolute inset-4 w-88 h-88 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="4"
              />

              {/* Progress track */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.89} ${
                  (100 - progress) * 2.89
                }`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Central content - Time display and button centered together */}
            <div className="absolute inset-0 flex items-center justify-center mt-8">
              <div className="flex flex-col items-center">
                {/* Time display */}
                <div className="text-7xl font-bold text-amber-900 tracking-tight text-center">
                  {formatTime(timeRemaining)}
                </div>

                {/* Pause/Resume and Reset buttons */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={onPause}
                    disabled={isOnBreak || pauseLoading}
                    className={`group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white border transition-all duration-200 shadow-sm hover:shadow-md font-semibold rounded-xl ${
                      isOnBreak
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : isPaused
                        ? "border-green-200 hover:border-green-300 text-green-700 hover:text-green-800"
                        : "border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800"
                    }`}
                  >
                    {pauseLoading ? (
                      <span className="text-xs animate-pulse">...</span>
                    ) : isPaused ? (
                      <Play
                        size={16}
                        className="transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <Pause
                        size={16}
                        className="transition-transform group-hover:scale-110"
                      />
                    )}
                  </button>

                  <button
                    onClick={onReset}
                    disabled={isOnBreak || resetLoading}
                    className={`group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white border transition-all duration-200 shadow-sm hover:shadow-md font-semibold rounded-xl ${
                      isOnBreak
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800"
                    }`}
                  >
                    {resetLoading ? (
                      <span className="text-xs animate-pulse">...</span>
                    ) : (
                      <RotateCcw
                        size={16}
                        className="transition-transform group-hover:rotate-180"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Break Timer */}
        {isOnBreak && (
          <div className="animate-fade-in-scale ml-8">
            <div className="relative w-80 h-80 rounded-full bg-white shadow-lg border-2 border-emerald-200">
              {/* Break timer progress ring */}
              <svg
                className="absolute inset-4 w-72 h-72 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="4"
                />

                {/* Progress track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    ((5 * 60 - breakTimeRemaining) / (5 * 60)) * 289
                  } ${(breakTimeRemaining / (5 * 60)) * 289}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Break timer central content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  {/* Break label */}
                  <div className="text-lg font-semibold text-emerald-700 mb-2">
                    Break Time
                  </div>

                  {/* Break time display */}
                  <div className="text-5xl font-bold text-emerald-900 tracking-tight text-center">
                    {formatTime(breakTimeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
