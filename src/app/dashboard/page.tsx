"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/actions/auth";
import { useSounds } from "@/hooks/useSounds";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  LogOut,
  Timer,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  Flame,
  Smartphone,
  Trophy,
  Activity,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [ritualStep, setRitualStep] = useState<string>("");
  const [selectedTimer, setSelectedTimer] = useState<string>("");
  const [isWaitingForSession, setIsWaitingForSession] = useState(false);
  const { playNotification, playBuzz } = useSounds();

  // Boilerplate statistics data
  const [stats] = useState({
    totalSessions: 24,
    completedSessions: 18,
    totalFocusTime: 1260, // in minutes (21 hours)
    streakDays: 7,
    favoriteMode: "honey-flow",
    weeklyFocus: [45, 60, 90, 45, 75, 120, 90], // minutes per day for the last 7 days
    avgSessionLength: 70, // minutes
    completionRate: 75, // percentage
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

  // Generate session ID and QR code for pairing
  useEffect(() => {
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

    // Create the QR code value
    const baseUrl = window.location.origin;
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

  // WebSocket connection for session pairing
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Loading your hive dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
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
      {/* Background honeycomb pattern */}
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

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-900">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-700">Dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-amber-700">Welcome back,</p>
              <p className="font-semibold text-amber-900">
                {user?.displayName || user?.email || "Busy Bee"}! 🐝
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-amber-800 font-bold rounded-xl transition-colors duration-200 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogOut size={16} />
              )}
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="px-4 md:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
                Hey there, wonderful bee! 🐝✨
              </h2>
              <p className="text-xl md:text-2xl text-amber-800 leading-relaxed max-w-3xl mx-auto mb-4">
                I'm so excited to see you back in our cozy hive!
              </p>
              <p className="text-lg md:text-xl text-amber-700 leading-relaxed max-w-2xl mx-auto">
                You've been doing absolutely amazing with your focus journey.
                Ready for another productive adventure together?
              </p>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* QR Code Section - Takes up 5 columns on large screens */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start">
                <div className="bg-white p-8 rounded-3xl shadow-2xl animate-pulse-glow mb-6">
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
                          <p className="text-lg text-gray-600 font-mono mt-4">
                            Generating QR Code...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xl text-amber-800 text-center max-w-sm leading-relaxed mb-6">
                  <span className="font-semibold">Scan this code</span> with
                  your phone to start your Focus Zone habit
                </p>

                {/* Status indicators */}
                {isWaitingForSession ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                        <Clock size={20} className="text-white" />
                      </div>
                      <p className="text-xl font-semibold text-amber-800">
                        Session Starting!
                      </p>
                    </div>
                    <p className="text-amber-700 text-lg">
                      Great! Your focus ritual is complete. Launching your focus
                      zone...
                    </p>
                  </div>
                ) : isPhoneConnected ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone size={20} className="text-white" />
                      </div>
                      <p className="text-xl font-semibold text-green-800">
                        Phone Connected! 📱
                      </p>
                    </div>
                    <p className="text-green-700 text-lg mb-4">
                      Follow the steps on your phone to complete the focus
                      ritual.
                    </p>

                    {ritualStep && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <p className="text-amber-800 font-medium mb-2">
                          Current step:
                        </p>
                        <p className="text-amber-700">{ritualStep}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-6 w-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone size={32} className="text-amber-600" />
                      </div>
                      <p className="text-amber-800 font-medium text-lg">
                        Ready to Focus! 🎯
                      </p>
                      <p className="text-amber-600 text-sm mt-2">
                        Scan the QR code to begin your focus ritual
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Stats - Takes up 7 columns on large screens */}
              <div className="lg:col-span-7">
                {/* Unified Progress Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200 h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-amber-900 mb-3">
                      Look at Your Amazing Progress! 🌟
                    </h3>
                    <p className="text-base md:text-lg text-amber-700">
                      Every session makes you stronger and more focused!
                    </p>
                  </div>

                  {/* Main Stats Grid - 2x2 Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Total Sessions */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-amber-200 text-center">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy size={24} className="text-white" />
                      </div>
                      <div className="text-3xl font-bold text-amber-900 mb-2">
                        {stats.totalSessions}
                      </div>
                      <div className="text-amber-700 font-medium mb-2">
                        Total Sessions
                      </div>
                      <div className="text-sm text-amber-600">
                        Building incredible habits! 🎯
                      </div>
                    </div>

                    {/* Total Focus Time */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={24} className="text-white" />
                      </div>
                      <div className="text-3xl font-bold text-green-800 mb-2">
                        {formatTime(stats.totalFocusTime)}
                      </div>
                      <div className="text-green-700 font-medium mb-2">
                        Total Focus Time
                      </div>
                      <div className="text-sm text-green-600">
                        Amazing dedication! 💚
                      </div>
                    </div>

                    {/* Day Streak */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 text-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame size={24} className="text-white" />
                      </div>
                      <div className="text-3xl font-bold text-orange-800 mb-2">
                        {stats.streakDays}
                      </div>
                      <div className="text-orange-700 font-medium mb-2">
                        Day Streak
                      </div>
                      <div className="text-sm text-orange-600">
                        Keep that fire burning! 🔥
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target size={24} className="text-white" />
                      </div>
                      <div className="text-3xl font-bold text-purple-800 mb-2">
                        {stats.completionRate}%
                      </div>
                      <div className="text-purple-700 font-medium mb-2">
                        Success Rate
                      </div>
                      <div className="text-sm text-purple-600">
                        You're unstoppable! 🚀
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary content row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Weekly Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">
                      Weekly Focus Buzz! 📊
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Look how consistent you've been!
                    </p>
                  </div>
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
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="w-full bg-amber-100 rounded-t-xl relative">
                          <div
                            className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-xl flex items-end justify-center transition-all duration-1000 ease-out"
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

              {/* Quick Insights */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Activity size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">
                      Quick Insights 🔍
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Your focus patterns at a glance
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Star size={20} className="text-amber-600" />
                      <span className="text-amber-800 font-medium">
                        Favorite Mode
                      </span>
                    </div>
                    <span className="font-bold text-amber-900 capitalize">
                      {stats.favoriteMode?.replace("-", " ")} 💛
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Timer size={20} className="text-green-600" />
                      <span className="text-green-800 font-medium">
                        Average Session
                      </span>
                    </div>
                    <span className="font-bold text-green-900">
                      {formatTime(stats.avgSessionLength)} ⏱️
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        Completion Rate
                      </span>
                    </div>
                    <span className="font-bold text-blue-900">
                      {stats.completedSessions}/{stats.totalSessions} ✅
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-6">
                  Your Daily Bee Wisdom 🌻
                </h3>
                <p className="text-lg md:text-xl text-amber-700 leading-relaxed">
                  "Remember, even the busiest bees take time to rest between
                  flights! You're doing incredible work building these focus
                  habits. I'm so proud of how far you've come, and I can't wait
                  to see what amazing things you'll accomplish next! Keep being
                  awesome! 🌟"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
