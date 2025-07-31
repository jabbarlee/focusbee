"use client";

import { CheckCircle, X, Coffee } from "lucide-react";
import { Button } from "@/components/ui";

interface ControlButtonsProps {
  isOnBreak: boolean;
  breakCount: number;
  maxBreaks: number;
  onCompleteSession: () => void;
  onCancelSession: () => void;
  onBreak: () => void;
  completeLoading?: boolean;
  cancelLoading?: boolean;
  breakLoading?: boolean;
}

export function ControlButtons({
  isOnBreak,
  breakCount,
  maxBreaks,
  onCompleteSession,
  onCancelSession,
  onBreak,
  completeLoading = false,
  cancelLoading = false,
  breakLoading = false,
}: ControlButtonsProps) {
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="success"
          size="sm"
          onClick={onCompleteSession}
          disabled={!!completeLoading}
        >
          <CheckCircle
            size={16}
            className="transition-transform group-hover:scale-110"
          />
          <span className="text-sm">
            {completeLoading ? "Completing..." : "Complete"}
          </span>
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onCancelSession}
          disabled={!!cancelLoading}
        >
          <X size={16} className="transition-transform group-hover:rotate-90" />
          <span className="text-sm">
            {cancelLoading ? "Cancelling..." : "Cancel"}
          </span>
        </Button>

        <Button
          variant="warning"
          size="sm"
          onClick={onBreak}
          disabled={(!isOnBreak && breakCount >= maxBreaks) || !!breakLoading}
          className={`$${
            !isOnBreak && breakCount >= maxBreaks
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Coffee
            size={16}
            className="transition-transform group-hover:scale-110"
          />
          <span className="text-sm">
            {breakLoading
              ? isOnBreak
                ? "Finishing..."
                : "Starting..."
              : isOnBreak
              ? "Finish Break"
              : "Break"}
          </span>
          {!isOnBreak && (
            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {maxBreaks - breakCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
