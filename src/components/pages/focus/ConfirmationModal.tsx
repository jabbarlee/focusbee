"use client";

import { Home, Play } from "lucide-react";
import { Button } from "@/components/ui";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-200 max-w-lg w-full mx-4 transform animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-amber-900 mb-3">
            Complete this session?
          </h3>
          <p className="text-amber-800 leading-relaxed">
            Your focus session is still active. If you go to the dashboard now,
            this session will be marked as complete.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            size="md"
            onClick={onConfirm}
            className="shadow-lg hover:shadow-xl flex-1 sm:flex-initial min-w-0"
          >
            <Home size={18} />
            Go to Dashboard
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500 hover:border-gray-600 shadow-lg hover:shadow-xl flex-1 sm:flex-initial min-w-0"
          >
            <Play size={18} />
            Continue Session
          </Button>
        </div>
      </div>
    </div>
  );
}
