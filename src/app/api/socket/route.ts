import { NextRequest, NextResponse } from "next/server";

// This is a simple endpoint to acknowledge the WebSocket setup
// The actual WebSocket server will run separately
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "WebSocket endpoint ready",
    port: 3001,
  });
}
