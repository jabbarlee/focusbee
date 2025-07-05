"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/actions/auth";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  LogOut,
  Smartphone,
  Trophy,
  Clock,
  Flame,
  Target,
  BarChart3,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [ritualStep, setRitualStep] = useState("");
  const [isWaitingForSession, setIsWaitingForSession] = useState(false);
  const { playNotification, playBuzz } = useSounds();

  // Boilerplate statistics data
  const [stats] = useState({
    totalSessions: 24,
    completedSessions: 18,
    totalFocusTime: 1260, // minutes
    streakDays: 7,
    favoriteMode: "honey-flow",
    weeklyFocus: [45, 60, 90, 45, 75, 120, 90],
    avgSessionLength: 70,
    completionRate: 75,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

  // Generate session ID and QR code
  useEffect(() => {
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const newId = generateUUID();
    setSessionId(newId);
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/session/${newId}`;
    setQrValue(qrUrl);

    const timer = setTimeout(() => {
      playNotification();
    }, 500);
    return () => clearTimeout(timer);
  }, [playNotification]);

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
    },
    onRitualComplete: (data) => {
      setIsWaitingForSession(true);
      setTimeout(() => {
        router.push(`/focus/${sessionId}?timer=${data.timer}`);
      }, 2000);
    },
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bee-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-amber-800">Loading your hive dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isWaitingForSession) {
    return (
      <div className="min-h-screen bg-bee-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Clock size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Session Activated! 🐝
          </h1>
          <p className="text-xl text-amber-800 mb-8 leading-relaxed">
            Great! Your focus ritual is complete. Launching your focus zone...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
      {/* Honeycomb background */}
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

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="relative">
          {/* Header background with gradient */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6">
              {/* Logo and branding */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-amber-900 tracking-tight">
                    Focus<span className="text-amber-600">Bee</span>
                  </h1>
                  <p className="text-sm text-amber-700 font-medium flex items-center gap-1">
                    <span>Your productivity hive</span>
                  </p>
                </div>
              </div>

              {/* User section and navigation */}
              <div className="flex items-center gap-3">
                {/* Navigation buttons with enhanced design language */}
                <div className="flex items-center gap-3">
                  {/* Settings button */}
                  <button
                    onClick={() => router.push("/account")}
                    className="group relative flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-md hover:bg-white/90 text-amber-800 font-semibold rounded-2xl transition-all duration-300 border border-amber-200/60 hover:border-amber-300/80 shadow-lg hover:shadow-xl"
                    title="Account Settings"
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Settings</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/20 to-amber-100/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="group relative flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-red-50 to-rose-50 backdrop-blur-md hover:from-red-100 hover:to-rose-100 text-red-700 hover:text-red-800 font-semibold rounded-2xl transition-all duration-300 border border-red-200/60 hover:border-red-300/80 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut
                        size={18}
                        className="transition-transform duration-300 group-hover:-translate-x-0.5"
                      />
                    )}
                    <span className="hidden sm:inline">
                      {isLoggingOut ? "Buzzing away..." : "Sign Out"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100/0 via-red-100/20 to-red-100/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8 pt-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* QR and status */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl animate-pulse-glow">
                  <div className="w-56 h-56 flex items-center justify-center">
                    {qrValue ? (
                      <QRCodeSVG
                        value={qrValue}
                        size={220}
                        level="M"
                        includeMargin
                        fgColor="#92400e"
                        bgColor="#fffbeb"
                      />
                    ) : (
                      <div className="w-52 h-52 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-4 border-amber-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-lg text-amber-800 text-center max-w-sm leading-relaxed">
                  <span className="font-semibold">Scan this code</span> with
                  your phone to begin your focus ritual.
                </p>
                {/* Status */}
                {isPhoneConnected ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 w-full text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Smartphone size={20} className="text-green-700" />
                      <p className="text-green-800 font-semibold">
                        Phone Connected!
                      </p>
                    </div>
                    {ritualStep && (
                      <p className="text-green-700">{ritualStep}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-6 w-full text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Smartphone size={20} className="text-amber-600" />
                      <p className="text-amber-800 font-semibold">
                        Ready to Focus
                      </p>
                    </div>
                    <p className="text-amber-600 text-sm">
                      Scan the QR code to connect your phone
                    </p>
                  </div>
                )}
              </div>

              {/* Stats and chart */}
              <div className="lg:col-span-7 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-yellow-50 rounded-2xl p-6 border border-amber-200 text-center">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-amber-900">
                      {stats.totalSessions}
                    </div>
                    <p className="text-amber-700 text-sm">Total Sessions</p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200 text-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatTime(stats.totalFocusTime)}
                    </div>
                    <p className="text-green-700 text-sm">Total Focus Time</p>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 text-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Flame size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-orange-800">
                      {stats.streakDays}
                    </div>
                    <p className="text-orange-700 text-sm">Day Streak</p>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200 text-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800">
                      {stats.completionRate}%
                    </div>
                    <p className="text-purple-700 text-sm">Success Rate</p>
                  </div>
                </div>

                {/* Weekly chart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900">
                      Weekly Focus
                    </h3>
                  </div>
                  <div className="flex items-end gap-2 h-32 mb-4">
                    {stats.weeklyFocus.map((minutes, index) => {
                      const height =
                        (minutes / Math.max(...stats.weeklyFocus)) * 100;
                      const days = [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                      ];
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div className="w-full bg-amber-100 rounded-t-xl relative">
                            <div
                              className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-xl flex items-end justify-center"
                              style={{ height: `${height}%` }}
                            >
                              <span className="text-white text-xs font-bold mb-1">
                                {minutes}m
                              </span>
                            </div>
                          </div>
                          <span className="text-amber-700 text-xs font-bold">
                            {days[index]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-amber-800 font-semibold">
                      Total this week:{" "}
                      {formatTime(stats.weeklyFocus.reduce((a, b) => a + b, 0))}{" "}
                      🎉
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-8 shadow-lg text-center">
              <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-6">
                Your Daily Bee Wisdom 🌻
              </h3>
              <p className="text-lg md:text-xl text-amber-700 leading-relaxed">
                "Remember, even the busiest bees take time to rest between
                flights! You're doing incredible work building these focus
                habits. I'm so proud of how far you've come, and I can't wait to
                see what amazing things you'll accomplish next! Keep being
                awesome! 🌟"
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
