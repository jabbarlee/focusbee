import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Smartphone,
  Shield,
  Target,
  Clock,
  Brain,
  TrendingUp,
  CheckCircle,
  Star,
  HelpCircle,
} from "lucide-react";

import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import { QRCodeSVG } from "qrcode.react";
import { focusModes } from "@/lib/data";

export default function LaptopLandingPage() {
  const benefits = [
    {
      icon: Brain,
      title: "Enhanced Focus",
      description:
        "Physical separation from your phone eliminates digital distractions and allows your brain to enter deep work mode.",
    },
    {
      icon: TrendingUp,
      title: "Increased Productivity",
      description:
        "Studies show that having your phone in another room can increase focus and task completion by up to 26%.",
    },
    {
      icon: Shield,
      title: "Reduced Anxiety",
      description:
        "Breaking the constant connectivity cycle helps reduce stress and anxiety associated with notification pressure.",
    },
    {
      icon: Target,
      title: "Better Work Quality",
      description:
        "Deep, uninterrupted work sessions lead to higher quality output and more creative problem-solving.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Scan the QR Code",
      description:
        "Use your phone to scan the QR code displayed above to get started.",
      icon: Smartphone,
    },
    {
      step: 2,
      title: "Follow the Ritual",
      description:
        "Complete the guided steps on your phone to prepare for focused work.",
      icon: CheckCircle,
    },
    {
      step: 3,
      title: "Place Phone Away",
      description:
        "Put your phone in another room and return to your laptop for deep work.",
      icon: Shield,
    },
    {
      step: 4,
      title: "Enter Flow State",
      description:
        "Begin your focused work session with complete digital separation.",
      icon: Brain,
    },
  ];

  // --- QR/session logic (mirroring page.tsx) ---
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

    // Create the QR code value using the environment variable and session ID
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
    // Match the robust dependency handling from page.tsx
  }, [playNotification]);

  // WebSocket connection - only initialize after sessionId is set
  useWebSocket({
    sessionId: sessionId || "",
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

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-20 max-w-6xl mx-auto flex items-center justify-between py-6 bg-bee-soft/80 backdrop-blur-md border-b border-amber-100">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-amber-900">
            Focus<span className="text-amber-600">Bee</span>
          </span>
        </div>
        {/* Center nav links */}
        <div className="flex gap-10">
          <Link
            href="#how-it-works"
            className="text-amber-900 font-medium transition hover:underline underline-offset-4"
          >
            How it works?
          </Link>
          <Link
            href="#benefits"
            className="text-amber-900 font-medium transition hover:underline underline-offset-4"
          >
            Benefits
          </Link>
          <Link
            href="#focus-modes"
            className="text-amber-900 font-medium transition hover:underline underline-offset-4"
          >
            Focus Modes
          </Link>
        </div>
        {/* CTA */}
        <div>
          <Button size="md">
            <Star
              size={20}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
            Join hive!
          </Button>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section - Two Column Layout */}
        <section className="relative overflow-hidden px-6 py-20 bg-gradient-to-br from-amber-50 via-amber-50/60 to-amber-100/30">
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b14_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b14_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

            {/* Floating circles */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-100/25 rounded-full blur-3xl animate-pulse delay-2000"></div>

            {/* Gradient overlays */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-50/30 via-transparent to-amber-100/20"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-50 to-transparent"></div>

            {/* Your existing diamond pattern (keeping it for texture) */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: "#fef3c7" }}
            >
              <div className="grid grid-cols-12 gap-4 p-8 transform rotate-12 scale-125">
                {Array.from({ length: 96 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 border-2 border-amber-400/40 transform rotate-45"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content with relative positioning to appear above background */}
          <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-5">
            {/* Left: Hero Text */}
            <div className="flex-1 min-w-[320px] text-left">
              <div className="mb-16">
                <h2 className="text-7xl font-bold text-amber-900 mb-8 leading-tight max-w-5xl">
                  Transform Your Work Habits Through
                  <span className="text-amber-600"> Phone Separation</span>
                </h2>
                <p className="text-3xl text-amber-800 leading-relaxed mb-12 max-w-4xl">
                  Break free from digital distractions and build lasting focus
                  habits with guided rituals and intentional phone separation.
                </p>
              </div>
            </div>

            {/* Right: QR Code (aligned to right) */}
            <div className="flex-1 min-w-[320px] flex flex-col items-end">
              <div className="flex flex-col items-end">
                <div className="bg-white p-10 rounded-3xl shadow-2xl animate-pulse-glow mb-8">
                  {/* QR Code - Made bigger */}
                  <div className="w-80 h-80 flex items-center justify-center">
                    {qrValue ? (
                      <QRCodeSVG
                        value={qrValue}
                        size={300}
                        level="M"
                        includeMargin={true}
                        fgColor="#92400e"
                        bgColor="#fffbeb"
                      />
                    ) : (
                      <div className="w-72 h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-4 border-amber-200">
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
                  <span className="font-semibold">Scan this code</span> with
                  your phone to get started
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-8"></div>

        {/* Why Phone Separation Matters */}
        <section className="px-6 py-20 bg-gradient-to-b from-amber-50/50 to-white/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={32} className="text-white" />
              </div>
              <h3 className="text-5xl font-bold text-amber-900 mb-4">
                Why Separate Your Phone?
              </h3>
              <p className="text-2xl text-amber-700 max-w-3xl mx-auto">
                The science behind phone-free focused work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-amber-900 mb-3">
                        {benefit.title}
                      </h4>
                      <p className="text-lg text-amber-800 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-8"></div>

        {/* Focus Modes */}
        <section className="px-6 py-20 bg-gradient-to-b from-white/40 to-amber-50/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={32} className="text-white" />
              </div>
              <h3 className="text-5xl font-bold text-amber-900 mb-4">
                Choose Your Focus Mode
              </h3>
              <p className="text-2xl text-amber-700 max-w-3xl mx-auto">
                Different session lengths for different types of work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {focusModes.map((mode) => (
                <div
                  key={mode.id}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100"
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-full flex items-center justify-center`}
                    >
                      <mode.icon size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-amber-900">
                        {mode.name}
                      </h4>
                      <p className="text-lg text-amber-600 font-medium">
                        {mode.duration} minutes
                      </p>
                    </div>
                  </div>
                  <p className="text-lg text-amber-800 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-8"></div>

        {/* How It Works */}
        <section className="px-6 py-20 bg-gradient-to-b from-white/60 to-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-5xl font-bold text-amber-900 mb-4">
                How FocusBee Works
              </h3>
              <p className="text-2xl text-amber-700 max-w-3xl mx-auto">
                Simple steps to deep focus
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-xl font-bold">
                      {step.step}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <step.icon size={24} className="text-amber-600" />
                      <h4 className="font-bold text-amber-900 text-lg">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-lg text-amber-800 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent mx-8"></div>

        {/* Call to Action */}
        <section className="px-6 py-24 bg-gradient-to-b from-amber-50/60 to-amber-100/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-12 text-white shadow-2xl">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Smartphone size={40} className="text-white" />
              </div>

              <h3 className="text-4xl font-bold mb-6">
                Start Your Focus Journey
              </h3>

              <p className="mb-8 text-amber-100 leading-relaxed text-2xl max-w-2xl mx-auto">
                Distance from your phone increases focus. We turn that into a
                daily habit you'll love.
              </p>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 text-lg font-medium mb-2">
                  <span>📱</span>
                  <span>Scan the QR code above to begin</span>
                </div>
                <p className="text-sm text-amber-100">
                  Your focused work session is just one scan away
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-amber-700 mb-4">
              Build focus. Create habits. Separate distractions.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
