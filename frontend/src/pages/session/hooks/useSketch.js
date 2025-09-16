import { useState, useEffect, useContext } from "react";
import SessionSocketContext from "../context/SessionSocketContext";

const useSketch = (sessionId) => {
  const [sketch, setSketch] = useState([]);
  const { socketRef, sendEvent, connected } = useContext(SessionSocketContext);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !connected) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "sketch_sync") {
          let content = data.content;
          // Defensive: server should send array, but parse string just in case
          if (typeof content === "string") {
            try {
              content = JSON.parse(content);
            } catch {
              content = [];
            }
          }
          if (!Array.isArray(content)) content = [];
          setSketch(content);
        }

        if (data.type === "sketch_update") {
          const action = data.content;
          if (action && typeof action === "object") {
            setSketch((prev) => [...prev, action]);
          }
        }

        if (data.type === "sketch_cleared") {
          setSketch([]); // wipe local history
          return;
        }
      } catch (e) {
        console.error("❌ Failed to parse WS message:", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // 🔑 Handshake: request current sketch AFTER listener is attached
    try {
      sendEvent("sketch_get", {});
    } catch (e) {
      console.warn("Could not request sketch:", e);
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socketRef, connected, sessionId, sendEvent]);

  // Send a single action to backend; rely on broadcast to append (avoid double-add)
  const sendSketchUpdate = (action) => {
    const socket = socketRef?.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ Cannot send sketch update, socket not ready");
      return;
    }
    sendEvent("sketch_update", { content: action });
  };

  return { sketch, setSketch, sendSketchUpdate };
};

export default useSketch;
