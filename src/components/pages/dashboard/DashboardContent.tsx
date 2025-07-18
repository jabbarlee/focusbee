"use client";

import { useState } from "react";
import { QRConnection } from "./QRConnection";
import { StatsDisplay } from "./StatsDisplay";
import { SessionsHistory } from "./SessionsHistory";
import { SessionWaitingScreen } from "./SessionWaitingScreen";

interface DashboardContentProps {
  user: any;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [isWaitingForSession, setIsWaitingForSession] = useState(false);

  if (isWaitingForSession) {
    return <SessionWaitingScreen />;
  }

  return (
    <main className="flex-1 px-4 md:px-8 pt-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* QR and status */}
          <div className="lg:col-span-5">
            <QRConnection
              user={user}
              onWaitingForSession={setIsWaitingForSession}
            />
          </div>

          {/* Stats and chart */}
          <div className="lg:col-span-7">
            <StatsDisplay user={user} />
          </div>
        </div>

        {/* Sessions History */}
        <SessionsHistory user={user} />
      </div>
    </main>
  );
}
