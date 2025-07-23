"use client";

import { SessionWrapper } from "@/components/pages/session";
import { useParams, useSearchParams } from "next/navigation";

export default function GuestSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;

  // Extract timer info from URL params for guest sessions
  const timer = searchParams.get("timer") || "honey-flow";

  return (
    <SessionWrapper sessionId={sessionId} isGuest={true} guestTimer={timer} />
  );
}
