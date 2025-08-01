"use client";

import { FocusWrapper } from "@/components/pages/focus";
import { useParams } from "next/navigation";

export default function FocusZonePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <FocusWrapper sessionId={sessionId} />;
}
