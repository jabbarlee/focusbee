"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useSounds } from "@/hooks/useSounds";
import { Smartphone, Shield, Zap, Target } from "lucide-react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const { playNotification } = useSounds();

  useEffect(() => {
    // Generate a unique session ID when the component mounts
    const newSessionId = `focusbee-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    setSessionId(newSessionId);

    // Create the QR code value (could be a URL or just the session ID)
    const baseUrl = "http://10.0.1.94:3000";
    const qrUrl = `${baseUrl}/session/${newSessionId}`;
    setQrValue(qrUrl);

    // Play a gentle notification when QR code is ready
    const timer = setTimeout(() => {
      playNotification();
    }, 500);

    return () => clearTimeout(timer);
  }, [playNotification]);

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
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    1
                  </div>
                  <p>Scan the QR code with your phone</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    2
                  </div>
                  <p>Follow the guided ritual</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    3
                  </div>
                  <p>Create distance from your phone</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-amber-900 font-bold">
                    4
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
    </div>
  );
}
