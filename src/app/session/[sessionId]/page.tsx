"use client";

import { SessionWrapper } from "@/components/pages/session";
import { useParams } from "next/navigation";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <SessionWrapper sessionId={sessionId} />;
}
