import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketProps {
  sessionId: string;
  onPhoneConnected?: () => void;
  onRitualStep?: (data: {
    step: string;
    stepNumber: number;
    totalSteps: number;
  }) => void;
  onTimerSelected?: (data: { timer: string; timerName: string }) => void;
  onRitualComplete?: (data: { timer: string }) => void;
}

export function useWebSocket({
  sessionId,
  onPhoneConnected,
  onRitualStep,
  onTimerSelected,
  onRitualComplete,
}: UseWebSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize event handlers to prevent unnecessary reconnections
  const handlePhoneConnected = useCallback(() => {
    console.log('Phone connected event received');
    onPhoneConnected?.();
  }, [onPhoneConnected]);

  const handleRitualStep = useCallback((data: any) => {
    console.log('Ritual step event received:', data);
    onRitualStep?.(data);
  }, [onRitualStep]);

  const handleTimerSelected = useCallback((data: any) => {
    console.log('Timer selected event received:', data);
    onTimerSelected?.(data);
  }, [onTimerSelected]);

  const handleRitualComplete = useCallback((data: any) => {
    console.log('Ritual complete event received:', data);
    onRitualComplete?.(data);
  }, [onRitualComplete]);

  useEffect(() => {
    if (!sessionId || sessionId.trim() === '') {
      console.log('No sessionId provided, skipping WebSocket connection');
      return;
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('Socket already connected, skipping...');
      return;
    }

    console.log('Initializing WebSocket connection for session:', sessionId);

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Get the current hostname to determine if we're on localhost or network
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsUrl = hostname === 'localhost' ? 'http://localhost:3001' : `http://${hostname}:3001`;
    
    console.log('Connecting to WebSocket at:', wsUrl);

    // Initialize socket connection
    socketRef.current = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 5000,
      forceNew: false,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("WebSocket connected to session:", sessionId);
      setIsConnected(true);
      setConnectionAttempts(0);
      socket.emit("join-session", sessionId);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
      
      // Only attempt reconnection for certain reasons
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.log('Manual disconnect, not reconnecting');
        return;
      }
    });

    socket.on("connect_error", (error: any) => {
      console.error("WebSocket connection error:", error.message);
      setConnectionAttempts((prev) => prev + 1);
    });

    // Set up event listeners
    socket.on("phone-connected", handlePhoneConnected);
    socket.on("ritual-step", handleRitualStep);
    socket.on("timer-selected", handleTimerSelected);
    socket.on("ritual-complete", handleRitualComplete);

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [sessionId]);

  const emitPhoneConnected = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('Emitting phone connected for session:', sessionId);
      socketRef.current.emit("phone-connected", { sessionId });
    } else {
      console.warn('Cannot emit phone connected - socket not ready');
    }
  }, [sessionId, isConnected]);

  const emitRitualStep = useCallback((
    step: string,
    stepNumber: number,
    totalSteps: number
  ) => {
    if (socketRef.current && isConnected) {
      console.log('Emitting ritual step:', step);
      socketRef.current.emit("ritual-step", {
        sessionId,
        step,
        stepNumber,
        totalSteps,
      });
    } else {
      console.warn('Cannot emit ritual step - socket not ready');
    }
  }, [sessionId, isConnected]);

  const emitTimerSelected = useCallback((timer: string, timerName: string) => {
    if (socketRef.current && isConnected) {
      console.log('Emitting timer selected:', timerName);
      socketRef.current.emit("timer-selected", { sessionId, timer, timerName });
    } else {
      console.warn('Cannot emit timer selected - socket not ready');
    }
  }, [sessionId, isConnected]);

  const emitRitualComplete = useCallback((timer: string) => {
    if (socketRef.current && isConnected) {
      console.log('Emitting ritual complete for timer:', timer);
      socketRef.current.emit("ritual-complete", { sessionId, timer });
    } else {
      console.warn('Cannot emit ritual complete - socket not ready');
    }
  }, [sessionId, isConnected]);

  return {
    isConnected,
    connectionAttempts,
    emitPhoneConnected,
    emitRitualStep,
    emitTimerSelected,
    emitRitualComplete,
  };
}
