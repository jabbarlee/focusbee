"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";
import {
  LogOut,
  Timer,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  Flame,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

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

  const handleStartFocus = () => {
    // Generate a random session ID for testing
    const sessionId = Math.random().toString(36).substring(2, 15);
    router.push(`/session/${sessionId}`);
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
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-900 mb-4">
                Ready to Focus? 🎯
              </h2>
              <p className="text-xl text-amber-700 leading-relaxed max-w-2xl mx-auto">
                Your bee companion is here to help you achieve amazing focus
                sessions. Let's build productive habits together!
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Timer size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-900">0</p>
                    <p className="text-sm text-amber-700">Focus Sessions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-900">0h 0m</p>
                    <p className="text-sm text-amber-700">Total Focus Time</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-900">0</p>
                    <p className="text-sm text-amber-700">Day Streak</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start focus section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200 mb-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">
                  Start Your Focus Journey
                </h3>
                <p className="text-amber-700 mb-6">
                  Choose from our specially designed focus sessions to boost
                  your productivity
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="border-2 border-amber-200 rounded-2xl p-4 hover:border-amber-400 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={20} className="text-yellow-600" />
                      <h4 className="font-bold text-amber-900">Buzz Burst</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      20 min quick session
                    </p>
                  </div>

                  <div className="border-2 border-amber-200 rounded-2xl p-4 hover:border-amber-400 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame size={20} className="text-orange-600" />
                      <h4 className="font-bold text-amber-900">Hive Hustle</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      40 min solid work block
                    </p>
                  </div>

                  <div className="border-2 border-amber-200 rounded-2xl p-4 hover:border-amber-400 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Timer size={20} className="text-purple-600" />
                      <h4 className="font-bold text-amber-900">Deep Dive</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      90 min immersive session
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartFocus}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto group"
                >
                  <Star
                    size={20}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                  Start Focus Session
                </button>
              </div>
            </div>

            {/* Companion message */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 shadow-lg">
              <div className="text-center">
                <p className="text-amber-700 leading-relaxed">
                  "Welcome to your personalized dashboard! I'm so excited to be
                  your focus companion. Every session you complete here will
                  help build stronger focus habits. Let's achieve great things
                  together! 🚀"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
