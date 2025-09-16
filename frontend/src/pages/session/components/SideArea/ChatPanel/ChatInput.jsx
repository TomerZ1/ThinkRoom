import React, { useState } from "react";
import styles from "./chat.module.css";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form className={styles["chat-input"]} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles["chat-input-field"]}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit" className={styles["chat-send-btn"]}>
        <i className="pi pi-send"></i>
      </button>
    </form>
  );
};

export default ChatInput;
