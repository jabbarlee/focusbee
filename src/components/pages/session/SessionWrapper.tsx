"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import { focusModes, ritualSteps, FocusMode } from "@/lib/data";
import { getSessionById } from "@/actions/db/sessions";
import { Session } from "@/types/dbSchema";
import { LoadingSpinner } from "./LoadingSpinner";
import { SessionNotFound } from "./SessionNotFound";
import { SessionCompleted } from "./SessionCompleted";
import { TimerSelection } from "./TimerSelection";
import { SessionStart } from "./SessionStart";
import { RitualComplete } from "./RitualComplete";
import { RitualStep } from "./RitualStep";

interface SessionWrapperProps {
  sessionId: string;
}

export function SessionWrapper({ sessionId }: SessionWrapperProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<string | null>(null);
  const [timerConfirmed, setTimerConfirmed] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<
    "loading" | "active" | "completed" | "not-found"
  >("loading");

  const { playBuzz, playSuccess, playStepComplete, playQRScan } = useSounds();

  // WebSocket connection for real-time communication with laptop
  const {
    isConnected,
    emitPhoneConnected,
    emitRitualStep,
    emitTimerSelected,
    emitRitualComplete,
  } = useWebSocket({
    sessionId,
  });

  const timerOptions = focusModes;
  const steps = ritualSteps;

  // Check session status from database
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;

      // Check if this is a temporary session ID (not from database)
      if (sessionId.startsWith("temp_")) {
        setSessionStatus("active");
        setIsLoadingSession(false);
        return;
      }

      setIsLoadingSession(true);
      try {
        const result = await getSessionById(sessionId);

        if (result.success && result.data) {
          const session = result.data;
          setSessionData(session);

          if (session.status === "completed") {
            setSessionStatus("completed");
          } else {
            setSessionStatus("active");
          }
        } else {
          console.error("Session not found:", result.error);
          setSessionStatus("not-found");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionStatus("not-found");
      } finally {
        setIsLoadingSession(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Play welcome sound when session page loads (QR scanned)
  useEffect(() => {
    const timer = setTimeout(() => {
      playQRScan();

      // Wait for WebSocket connection before emitting
      const checkConnectionAndEmit = () => {
        if (isConnected) {
          emitPhoneConnected();
        } else {
          // Retry after a short delay
          setTimeout(checkConnectionAndEmit, 500);
        }
      };

      checkConnectionAndEmit();
    }, 1000); // Increased delay to allow connection to establish

    return () => clearTimeout(timer);
  }, [playQRScan, emitPhoneConnected, isConnected]);

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
      setCountdown(3);
      setIsCountdownActive(true);
      playStepComplete();

      // Emit step progress via WebSocket
      emitRitualStep("Step 1: Standing up", 1, steps.length);

      setCurrentStep((prev) => prev + 1);
    } else if (currentStep < steps.length - 1) {
      playStepComplete();

      // Emit current step progress via WebSocket
      const nextStep = currentStep + 1;
      const stepDescriptions = [
        "Step 1: Standing up",
        "Step 2: Walking away",
        "Step 3: Placing phone",
        "Step 4: Returning to workspace",
      ];

      emitRitualStep(
        stepDescriptions[nextStep] || `Step ${nextStep + 1}`,
        nextStep + 1,
        steps.length
      );

      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - play success sound and emit completion
      playSuccess();

      // Emit ritual completion via WebSocket
      if (selectedTimer) {
        console.log(
          "Emitting ritual complete with selected timer:",
          selectedTimer
        ); // Debug log
        emitRitualComplete(selectedTimer);
      } else {
        console.error("No timer selected when completing ritual!"); // Debug log
      }

      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    setTimerStartTime(new Date());
    setIsStarted(true);

    // Emit ritual start via WebSocket
    emitRitualStep("Focus ritual started", 0, steps.length);
  };

  const handleTimerSelect = (timerId: string) => {
    setSelectedTimer(selectedTimer === timerId ? null : timerId);
  };

  const handleConfirmTimer = () => {
    setTimerConfirmed(true);
    playBuzz();

    // Emit timer selection via WebSocket
    const selectedTimerData = timerOptions.find((t) => t.id === selectedTimer);
    if (selectedTimerData) {
      console.log(
        "Emitting timer selected:",
        selectedTimer,
        selectedTimerData.name
      ); // Debug log
      emitTimerSelected(selectedTimer!, selectedTimerData.name);
    }
  };

  const handleBackToTimerSelection = () => {
    setTimerConfirmed(false);
  };

  // Loading state
  if (isLoadingSession) {
    return <LoadingSpinner />;
  }

  // Session not found
  if (sessionStatus === "not-found") {
    return <SessionNotFound />;
  }

  // Session completed
  if (sessionStatus === "completed" && sessionData) {
    return <SessionCompleted sessionData={sessionData} sessionId={sessionId} />;
  }

  // Timer selection screen
  if (!timerConfirmed) {
    return (
      <TimerSelection
        sessionId={sessionId}
        timerOptions={timerOptions}
        selectedTimer={selectedTimer}
        onTimerSelect={handleTimerSelect}
        onConfirmTimer={handleConfirmTimer}
      />
    );
  }

  // Session start screen
  if (!isStarted) {
    return (
      <SessionStart
        sessionId={sessionId}
        selectedTimer={selectedTimer}
        timerOptions={timerOptions}
        onStart={handleStart}
        onBackToTimerSelection={handleBackToTimerSelection}
      />
    );
  }

  // Ritual complete screen
  if (currentStep >= steps.length) {
    return (
      <RitualComplete
        sessionId={sessionId}
        selectedTimer={selectedTimer}
        timerOptions={timerOptions}
      />
    );
  }

  // Ritual step screen
  return (
    <RitualStep
      currentStep={currentStep}
      steps={steps}
      countdown={countdown}
      isCountdownActive={isCountdownActive}
      onStepComplete={handleStepComplete}
    />
  );
}
