"use client";

import { useParams } from "next/navigation";
import { FocusWrapper } from "./FocusWrapper";

export default function FocusPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <FocusWrapper sessionId={sessionId} />;
}
