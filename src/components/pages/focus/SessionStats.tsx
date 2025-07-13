"use client";

import { FocusMode } from "@/lib/data";

interface SessionStatsProps {
  selectedTimer: FocusMode;
  progress: number;
  timeRemaining: number;
  totalBreakTime: number;
}

export function SessionStats({
  selectedTimer,
  progress,
  timeRemaining,
  totalBreakTime,
}: SessionStatsProps) {
  return (
    <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
      <div className="grid grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-amber-900">
            {Math.round(progress)}%
          </div>
          <div className="text-sm text-amber-700">Progress</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-900">
            {Math.floor((selectedTimer.duration * 60 - timeRemaining) / 60)}m
          </div>
          <div className="text-sm text-amber-700">Time Focused</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-900">
            {Math.floor(timeRemaining / 60)}m
          </div>
          <div className="text-sm text-amber-700">Remaining</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-700">
            {Math.floor(totalBreakTime / 60)}m
          </div>
          <div className="text-sm text-emerald-600">Break Time</div>
        </div>
      </div>
    </div>
  );
}
