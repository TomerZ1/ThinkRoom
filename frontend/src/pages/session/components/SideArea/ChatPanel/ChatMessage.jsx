import React from "react";
import styles from "./chat.module.css";

const ChatMessage = ({ user, text, time, isMine, isSystem }) => {
  if (isSystem) {
    return <div className={styles["chat-message-system"]}>{text}</div>;
  }

  return (
    <div
      className={`${styles["chat-message"]} ${
        isMine ? styles["chat-message-mine"] : styles["chat-message-other"]
      }`}
    >
      <div className={styles["chat-message-header"]}>
        {isMine ? (
          <>
            <span className={`${styles["chat-time"]}`}>{time}</span>
            <span className={`${styles["chat-user-me"]}`}>{user}</span>
          </>
        ) : (
          <>
            <span className={styles["chat-user"]}>{user}</span>
            <span className={styles["chat-time"]}>{time}</span>
          </>
        )}
      </div>
      <div className={styles["chat-text"]}>{text}</div>
    </div>
  );
};

export default ChatMessage;
