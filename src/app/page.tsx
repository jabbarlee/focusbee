"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Smartphone, Shield, Zap, Target, Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();
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
    const baseUrl = "http://192.168.88.101:3000";
    const qrUrl = `${baseUrl}/session/${newSessionId}`;
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
        router.push(`/focus/${sessionId}?timer=${data.timer}`);
      }, 2000);
    },
  });

  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      {isWaitingForSession ? (
        /* Waiting for session completion state */
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <Clock size={48} className="text-white" />
            </div>

            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Session Activated! 🐝
            </h1>

            <p className="text-xl text-amber-800 mb-8 leading-relaxed">
              Great! Your focus ritual is complete. Launching your focus zone...
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                <p className="text-amber-700 font-medium">
                  Preparing your focus environment
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : isPhoneConnected ? (
        /* Phone connected, ritual in progress */
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Smartphone size={48} className="text-white" />
            </div>

            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Phone Connected! 📱
            </h1>

            <p className="text-xl text-amber-800 mb-8 leading-relaxed">
              Perfect! Continue the focus ritual on your phone. Your laptop will
              automatically launch the focus zone when you're done.
            </p>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-amber-700 font-medium">
                  Ritual in progress...
                </p>
              </div>

              {stepProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-amber-600 mb-2">
                    <span>Progress</span>
                    <span>
                      {stepProgress.stepNumber} of {stepProgress.totalSteps}
                    </span>
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (stepProgress.stepNumber / stepProgress.totalSteps) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {ritualStep && (
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-amber-800 font-semibold">Current step:</p>
                  <p className="text-amber-700">{ritualStep}</p>
                </div>
              )}
            </div>

            <div className="text-sm text-amber-600 bg-amber-50 rounded-xl p-4">
              💡 Keep this browser tab open. Your focus zone will launch
              automatically when the ritual is complete.
            </div>
          </div>
        </div>
      ) : (
        /* Normal QR code state */
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          {/* Header with FocusBee Branding */}
          <header className="text-center mb-20">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-amber-900 mb-4">
                Focus<span className="text-amber-600">Bee</span>
              </h1>
            </div>

            <p className="text-xl text-amber-800 max-w-2xl mx-auto leading-relaxed">
              Your cozy companion for deep focus sessions
            </p>
          </header>

          {/* ...existing code... */}

          {/* Main content area */}
          <main className="flex flex-col lg:flex-row items-center gap-20 max-w-6xl mx-auto">
            {/* QR Code Section */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl animate-pulse-glow mb-8">
                {/* QR Code */}
                <div className="w-64 h-64 flex items-center justify-center">
                  {qrValue ? (
                    <QRCodeSVG
                      value={qrValue}
                      size={240}
                      level="M"
                      includeMargin={true}
                      fgColor="#92400e"
                      bgColor="#fffbeb"
                      imageSettings={{
                        src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNmNmFkNTUiLz4KPGV5bGlwc2UgY3g9IjUwIiBjeT0iNTAiIHJ4PSI4IiByeT0iMTYiIGZpbGw9IiMyZDM3NDgiLz4KPGV5bGlwc2UgY3g9IjUwIiBjeT0iNDQiIHJ4PSI3IiByeT0iMyIgZmlsbD0iI2Y2YWQ1NSIvPgo8ZWxsaXBzZSBjeD0iNTAiIGN5PSI1NiIgcng9IjciIHJ5PSIzIiBmaWxsPSIjZjZhZDU1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjYiIGZpbGw9IiMyZDM3NDgiLz4KPGV5bGlwc2UgY3g9IjQyIiBjeT0iNDIiIHJ4PSI0IiByeT0iOCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIi8+CjxlbGxpcHNlIGN4PSI1OCIgY3k9IjQyIiByeD0iNCIgcnk9IjgiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIvPgo8L3N2Zz4K",
                        height: 32,
                        width: 32,
                        excavate: true,
                      }}
                    />
                  ) : (
                    <div className="w-60 h-60 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-4 border-amber-200">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 font-mono mt-4">
                          Generating QR Code...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-lg text-amber-800 text-center max-w-sm leading-relaxed">
                <span className="font-semibold">Scan this code</span> with your
                phone to start your Focus Zone habit
              </p>
            </div>

            {/* Instructions */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-amber-900 mb-6">
                  Ready to Focus?
                </h2>

                <div className="space-y-6 text-lg text-amber-800">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone size={20} className="text-amber-900" />
                    </div>
                    <p>Scan the QR code with your phone</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-amber-900" />
                    </div>
                    <p>Choose your focus duration</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap size={20} className="text-amber-900" />
                    </div>
                    <p>Follow the guided ritual</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target size={20} className="text-amber-900" />
                    </div>
                    <p>Create distance from your phone</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={20} className="text-amber-900" />
                    </div>
                    <p>Enter your focused work zone</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-20 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-amber-200">
              <p className="text-amber-700 mb-2">
                <span className="font-semibold">🔐 Privacy First</span> • No
                accounts required • No data stored
              </p>
              <p className="text-sm text-amber-600">
                Just you, your phone, and a friendly companion helping you focus
                better
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
