import { Button } from "@/components/ui/Button";
import { FocusMode } from "@/lib/data";

interface SessionCompletedViewProps {
  selectedTimer: FocusMode;
  actualFocusMinutes?: number;
  completedAt?: string;
  onGoToDashboard: () => void;
}

export function SessionCompletedView({
  selectedTimer,
  actualFocusMinutes = 0,
  completedAt,
  onGoToDashboard,
}: SessionCompletedViewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

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
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Session Completed
        </h1>

        {/* Session Details */}
        <div className="bg-white/60 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">
            {selectedTimer.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {selectedTimer.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">
                {selectedTimer.duration} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Focused Time:</span>
              <span className="font-medium">{actualFocusMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{formatDate(completedAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onGoToDashboard}
          className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          Back to Dashboard
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Start a new session to continue your focus journey
        </p>
      </div>
    </div>
  );
}
