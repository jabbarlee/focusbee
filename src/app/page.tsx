"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { Button } from "@/components/ui";
import { MobileLandingPage } from "@/components/pages/landing";
import { Smartphone, Clock, Zap, Target, Shield, Laptop } from "lucide-react";
import { LaptopLandingPage } from "@/components/pages/landing";

export default function Home() {
  const router = useRouter();
  const { isMobile, isLoading: deviceLoading } = useDeviceDetection();
  const [sessionId, setSessionId] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [isWaitingForSession, setIsWaitingForSession] = useState(false);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [ritualStep, setRitualStep] = useState<string>("");
  const [selectedTimer, setSelectedTimer] = useState<string>("");
  const [stepProgress, setStepProgress] = useState<{
    stepNumber: number;
    totalSteps: number;
  } | null>(null);
  const { playNotification, playBuzz } = useSounds();

  useEffect(() => {
    // Generate a unique session ID in UUID format when the component mounts
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    };
    const newSessionId = generateUUID();
    setSessionId(newSessionId);

    // Create the QR code value (could be a URL or just the session ID)
    const baseUrl = process.env.NEXT_PUBLIC_NETWORK_URL;
    const qrUrl = `${baseUrl}/session/g/${newSessionId}`;
    setQrValue(qrUrl);

    // Play a gentle notification when QR code is ready
    const timer = setTimeout(() => {
      playNotification();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [playNotification]);

  // WebSocket connection - only initialize after sessionId is set
  const { isConnected } = useWebSocket({
    sessionId: sessionId || "", // Provide fallback but the hook will check for empty sessionId
    onPhoneConnected: () => {
      setIsPhoneConnected(true);
      playBuzz();
    },
    onRitualStep: (data) => {
      setRitualStep(data.step);
      setStepProgress({
        stepNumber: data.stepNumber,
        totalSteps: data.totalSteps,
      });
    },
    onTimerSelected: (data) => {
      setSelectedTimer(data.timerName);
      setRitualStep(`Timer selected: ${data.timerName}`);
    },
    onRitualComplete: (data) => {
      setIsWaitingForSession(true);
      setTimeout(() => {
        router.push(`/focus/${sessionId}?timer=${data.timer}&guest=true`);
      }, 2000);
    },
  });

  // Show mobile landing page if on mobile device
  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-bee-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Loading FocusBee...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return <MobileLandingPage />;
  }

  return (
    <LaptopLandingPage/>
  );
}
