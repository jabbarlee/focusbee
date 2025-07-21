import { Button } from "@/components/ui/Button";
import { FocusMode } from "@/lib/data";

interface SessionCancelledScreenProps {
  selectedTimer?: FocusMode;
  onGoToDashboard: () => void;
}

export function SessionCancelledScreen({
  selectedTimer,
  onGoToDashboard,
}: SessionCancelledScreenProps) {
  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto text-center px-6">
        {/* Cancelled Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Session Cancelled
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-2 leading-relaxed">
          This focus session has been cancelled.
        </p>

        {selectedTimer && (
          <p className="text-sm text-gray-500 mb-8">
            {selectedTimer.name} session • {selectedTimer.duration} minutes
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={onGoToDashboard}
          className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          Start New Session
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Return to dashboard to begin a fresh focus session
        </p>
      </div>
    </div>
  );
}
