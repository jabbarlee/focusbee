"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import { createSession, getUserSessions } from "@/actions/db/sessions";

interface QRConnectionProps {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
  } | null;
  onWaitingForSession: (waiting: boolean) => void;
}

export function QRConnection({ user, onWaitingForSession }: QRConnectionProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [ritualStep, setRitualStep] = useState("");
  const [activeSession, setActiveSession] = useState<{
    id: string;
    status: string;
    focus_mode: string;
    created_at: string;
  } | null>(null);
  const [isCheckingActiveSession, setIsCheckingActiveSession] = useState(true);
  const [selectedFocusMode, setSelectedFocusMode] = useState<
    "quick-buzz" | "honey-flow" | "deep-nectar"
  >("honey-flow");
  const { playNotification, playBuzz } = useSounds();

  // Check for active sessions on component mount
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user?.uid) return;

      setIsCheckingActiveSession(true);
      try {
        const result = await getUserSessions(user.uid, {
          status: "active",
          limit: 1,
          orderBy: "created_at",
          order: "desc",
        });

        if (result.success && result.data && result.data.length > 0) {
          setActiveSession(result.data[0]);
        }
      } catch (error) {
        console.error("Error checking for active sessions:", error);
      } finally {
        setIsCheckingActiveSession(false);
      }
    };

    checkActiveSession();
  }, [user?.uid]);

  // Generate QR code for connecting phone (without creating session)
  useEffect(() => {
    const generateQRCode = () => {
      if (!user?.uid) return;

      // Generate a temporary session ID for QR code (not saved to database yet)
      const tempSessionId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setSessionId(tempSessionId);

      // Generate QR code with the temporary session ID
      const baseUrl = process.env.NEXT_PUBLIC_NETWORK_URL;
      const qrUrl = `${baseUrl}/session/${tempSessionId}`;
      setQrValue(qrUrl);

      const timer = setTimeout(() => {
        playNotification();
      }, 500);
      return () => clearTimeout(timer);
    };

    generateQRCode();
  }, [user?.uid, playNotification]);

  const { isConnected } = useWebSocket({
    sessionId: sessionId || "",
    onPhoneConnected: () => {
      setIsPhoneConnected(true);
      playBuzz();
    },
    onRitualStep: (data) => {
      setRitualStep(data.step);
    },
    onTimerSelected: (data) => {
      setRitualStep(`Timer selected: ${data.timerName}`);
      // Update the selected focus mode based on the timer selection
      const focusMode = data.timer as
        | "quick-buzz"
        | "honey-flow"
        | "deep-nectar";
      setSelectedFocusMode(focusMode);

      console.log("Timer selected in ritual:", focusMode); // Debug log
    },
    onRitualComplete: async (data) => {
      onWaitingForSession(true);

      // NOW create the actual database session when ritual is completed
      if (!user?.uid) {
        console.error("No user ID available for session creation");
        return;
      }

      // Use the focus mode directly from the ritual completion data to avoid race conditions
      const finalFocusMode = data.timer as
        | "quick-buzz"
        | "honey-flow"
        | "deep-nectar";
      console.log(
        "Creating session with focus mode from ritual data:",
        finalFocusMode
      ); // Debug log

      try {
        const result = await createSession({
          uid: user.uid,
          focus_mode: finalFocusMode, // Use focus mode directly from ritual completion
        });

        if (result.success && result.data) {
          const realSessionId = result.data.id;
          setSessionId(realSessionId); // Update with real session ID

          console.log("Session created successfully:", realSessionId);

          setTimeout(() => {
            router.push(`/focus/${realSessionId}`);
          }, 2000);
        } else {
          console.error("Failed to create session:", result.error);
          // Still navigate but with temp ID - the focus page will handle this
          setTimeout(() => {
            router.push(`/focus/${sessionId}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Error creating session:", error);
        // Still navigate but with temp ID
        setTimeout(() => {
          router.push(`/focus/${sessionId}`);
        }, 2000);
      }
    },
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
          <Smartphone size={24} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-amber-900">
          Start Focus Session
        </h3>
      </div>
      <p className="text-amber-700 mb-6 leading-relaxed text-lg">
        Connect your phone to begin a focused work session. Place your device in
        the ritual zone and let FocusBee guide you to productivity.
      </p>

      {/* QR Code Section */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-6 mb-4 flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-3xl shadow-xl">
            <div className="w-56 h-56 flex items-center justify-center">
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={220}
                  level="M"
                  includeMargin
                  fgColor="#92400e"
                  bgColor="#ffffff"
                />
              ) : (
                <div className="w-52 h-52 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-amber-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-amber-800 font-semibold text-base">
          Scan with your phone camera
        </p>
        <p className="text-center text-amber-600 text-sm mt-1">
          Point your camera at the QR code to connect instantly
        </p>
      </div>

      {/* Status */}
      <div>
        {isPhoneConnected ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-800 font-bold text-sm">
                Phone Connected!
              </p>
            </div>
            {ritualStep && (
              <p className="text-green-700 text-center text-xs">{ritualStep}</p>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
              <p className="text-amber-800 font-bold text-sm">
                Waiting for Connection
              </p>
            </div>
            <p className="text-amber-600 text-center text-xs">
              Open your camera app and scan the QR code above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
