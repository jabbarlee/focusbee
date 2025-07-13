"use client";

import { useRouter } from "next/navigation";
import { Target, Home } from "lucide-react";
import { Button } from "@/components/ui";

export function SessionNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-20">
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
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Target size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Session Not Found
          </h1>

          <p className="text-lg text-amber-800 mb-8 leading-relaxed">
            This session doesn't exist or has been removed.
          </p>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/dashboard")}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800"
          >
            <Home size={20} />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
