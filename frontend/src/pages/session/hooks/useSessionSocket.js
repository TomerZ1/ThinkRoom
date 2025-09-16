// useSessionSocket.js
import { useEffect, useRef, useState } from "react";
import { WEBSOCKET_BASE_URL } from "../../../shared/constants/config";
import { useAuth } from "../../auth/context/AuthContext";

const useSessionSocket = (sessionId) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !token) return;

    const timeoutId = setTimeout(() => {
      if (
        socketRef.current &&
        socketRef.current.readyState !== WebSocket.CLOSED &&
        socketRef.current.readyState !== WebSocket.CLOSING
      ) {
        return;
      }

      const socket = new WebSocket(
        `${WEBSOCKET_BASE_URL}/ws/sessions/${sessionId}?token=${token}`
      );
      console.log("🔌 Creating WS:", socket.url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ Session WebSocket connected");
        setConnected(true);
      };
      socket.onclose = () => {
        console.log("🚪 Session WebSocket disconnected");
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        setConnected(false);
      };
      socket.onerror = (err) =>
        console.error("❌ Session WebSocket error:", err);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      if (socketRef.current) {
        const currentSocket = socketRef.current;
        socketRef.current = null;
        if (
          currentSocket.readyState === WebSocket.OPEN ||
          currentSocket.readyState === WebSocket.CONNECTING
        ) {
          currentSocket.close();
        }
      }
      setConnected(false);
    };
  }, [sessionId, token]);

  const sendEvent = (type, payload) => {
    if (!socketRef.current) {
      console.log("❌ sendEvent: socketRef.current is null");
      throw new Error("WebSocket ref is null");
    }

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...payload }));
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  };

  return { socketRef, sendEvent, connected };
};

export default useSessionSocket;
