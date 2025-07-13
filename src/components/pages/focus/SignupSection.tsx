"use client";

import { Star } from "lucide-react";

interface SignupSectionProps {
  onJoinHive: () => void;
}

export function SignupSection({ onJoinHive }: SignupSectionProps) {
  return (
    <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg font-semibold text-amber-800">
            Your bee companion says:
          </span>
        </div>

        <h3 className="text-xl font-bold text-amber-900 mb-2">
          "Buzz buzz! Want to keep track of your amazing focus journey? 🐝"
        </h3>

        <p className="text-amber-700 mb-4 leading-relaxed">
          Join the hive and save your focus sessions! I'd love to help you see
          how much you've grown. It's free, simple, and I promise to keep
          cheering you on! ✨
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 group"
            onClick={onJoinHive}
          >
            <Star size={18} className="group-hover:animate-spin" />
            Join the Hive (Free!)
          </button>

          <button className="text-amber-700 hover:text-amber-800 font-medium underline transition-colors duration-200">
            Maybe later, busy bee! 🍯
          </button>
        </div>
      </div>
    </div>
  );
}
