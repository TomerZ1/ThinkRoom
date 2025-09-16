import { useAuth } from "../../../../auth/context/AuthContext";
import React, { useEffect, useRef } from "react";
import styles from "./chat.module.css";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import useChat from "../../../hooks/useChat";

const ChatPanel = ({ sessionId }) => {
  const { user } = useAuth();
  const { messages, loading, error, sendChatMessage } = useChat(sessionId);

  const messagesEndRef = useRef(null); // Ref to the end of messages list

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to bottom
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles["chat-panel"]}>
      <div className={styles["chat-messages"]}>
        {loading && <p>Loading messages...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            user={msg.username}
            text={msg.content}
            time={new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isMine={msg.username === user?.username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={sendChatMessage} />
    </div>
  );
};

export default ChatPanel;
