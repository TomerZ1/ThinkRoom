import { useState, useEffect, useContext } from "react";
import {
  fetchMessages as fetchMessagesApi,
  sendMessage as sendMessageApi,
} from "../services/chatService";
import { useAuth } from "../../auth/context/AuthContext";
import SessionSocketContext from "../context/SessionSocketContext";

const useChat = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();
  const { socketRef, sendEvent, connected } = useContext(SessionSocketContext);

  // Load history
  useEffect(() => {
    if (!sessionId || !token) return;
    (async () => {
      setLoading(true);
      try {
        const history = await fetchMessagesApi(sessionId);
        setMessages(history);
      } catch (err) {
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, token]);

  // WebSocket subscription (re-attach on connect/reconnect)
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !connected) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat_message") {
          setMessages((prev) => [
            ...prev,
            {
              id: data.id ?? `temp-${Date.now()}`,
              username: data.user,
              content: data.content,
              created_at: data.created_at ?? new Date().toISOString(),
            },
          ]);
        }
      } catch (e) {
        console.error("❌ Failed to parse WS message:", e);
      }
    };

    console.log("🔔 Attaching WS message listener");
    socket.addEventListener("message", handleMessage);
    return () => {
      console.log("🔕 Detaching WS message listener");
      socket.removeEventListener("message", handleMessage);
    };
  }, [socketRef, connected, sessionId]);

  const sendChatMessage = async (content) => {
    try {
      sendEvent("chat_message", { content });
      console.log("📤 Sent via WS:", content);
    } catch (err) {
      console.warn("⚠️ WS send failed, falling back to API");
      try {
        const newMessage = await sendMessageApi(content, sessionId);
        setMessages((prev) => [...prev, newMessage]);
      } catch (apiErr) {
        setError(apiErr.message || "Failed to send message");
      }
    }
  };

  return { messages, loading, error, sendChatMessage };
};

export default useChat;
