"use client";

import { useState, useEffect, useRef } from "react";
import { getUserSessions } from "@/actions/db/sessions";
import { SessionWithDuration } from "@/actions/db/sessions";
import { SessionStatus } from "@/types/dbSchema";
import { focusModes } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Target,
  Calendar,
  Play,
  CheckCircle,
  XCircle,
  Filter,
  ChevronRight,
  Timer,
  Zap,
  Flame,
  RefreshCw,
} from "lucide-react";

interface SessionsHistoryProps {
  user: any;
}

type FilterType = "all" | "active" | "completed" | "cancelled";

const statusIcons = {
  active: Play,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  active: "text-blue-500 bg-blue-50 border-blue-200",
  completed: "text-green-500 bg-green-50 border-green-200",
  cancelled: "text-red-500 bg-red-50 border-red-200",
};

const focusModeIcons = {
  "quick-buzz": Zap,
  "honey-flow": Flame,
  "deep-nectar": Timer,
};

export function SessionsHistory({ user }: SessionsHistoryProps) {
  const [sessions, setSessions] = useState<SessionWithDuration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, [user?.uid, filter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSessions = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);
    try {
      const statusFilter =
        filter === "all" ? undefined : (filter as SessionStatus);
      const result = await getUserSessions(user.uid, {
        status: statusFilter,
        limit: 50,
        orderBy: "created_at",
        order: "desc",
      });

      if (result.success && result.data) {
        console.log("Fetched sessions for user:", user.uid, result.data);
        setSessions(result.data);
      } else {
        console.error("Failed to fetch sessions:", result.error);
        setError(result.error || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const getFocusModeDetails = (focusMode: string) => {
    return focusModes.find((mode) => mode.id === focusMode);
  };

  const handleSessionClick = (sessionId: string, status: SessionStatus) => {
    if (status === "active") {
      router.push(`/focus/${sessionId}`);
    } else {
      router.push(`/session/${sessionId}`);
    }
  };

  const getFilterLabel = (filterType: FilterType) => {
    const labels = {
      all: "All Sessions",
      active: "Active Sessions",
      completed: "Completed Sessions",
      cancelled: "Cancelled Sessions",
    };
    return labels[filterType];
  };

  const getEmptyStateMessage = () => {
    const messages = {
      all: "No sessions found. Start your first focus session!",
      active: "No active sessions. Ready to start a new focus session?",
      completed: "No completed sessions yet. Complete your first session!",
      cancelled: "No cancelled sessions. Keep up the great work!",
    };
    return messages[filter];
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-blue-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-blue-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-blue-100 animate-pulse"
            >
              <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Your Focus Sessions
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSessions}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <div className="relative" ref={filterRef}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {getFilterLabel(filter)}
            </Button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {(
                  ["all", "active", "completed", "cancelled"] as FilterType[]
                ).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => {
                      setFilter(filterType);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      filter === filterType
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {getFilterLabel(filterType)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Error loading sessions</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐝</div>
          <p className="text-lg text-blue-700 mb-4">{getEmptyStateMessage()}</p>
          <p className="text-sm text-blue-600">
            Scan the QR code above to start your focus journey!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const focusModeDetails = getFocusModeDetails(session.focus_mode);
            const StatusIcon = statusIcons[session.status];
            const FocusModeIcon = focusModeIcons[session.focus_mode];

            return (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id, session.status)}
                className="bg-white rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition-all cursor-pointer hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full border ${
                        statusColors[session.status]
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2">
                      <FocusModeIcon
                        className={`w-4 h-4 ${focusModeDetails?.textColor}`}
                      />
                      <span className="font-medium text-gray-900">
                        {focusModeDetails?.name || session.focus_mode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{focusModeDetails?.duration || 0}m</span>
                      </div>

                      {session.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDuration(session.duration_minutes)}
                          </span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {formatDate(session.created_at)}
                  </span>

                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[session.status]
                    }`}
                  >
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
