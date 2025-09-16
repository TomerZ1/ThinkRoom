import React from "react";
import styles from "../../../styles/dashboard.module.css";

const SessionListItem = ({
  session,
  currentUserId,
  onDelete,
  onJoin,
  className = "",
}) => {
  const otherMember = session.members
    ? session.members.find((m) => m.id !== currentUserId)
    : null;

  const memberName = otherMember ? otherMember.username : "";

  return (
    <li className={`${styles["session-item"]} ${className}`}>
      <span className={styles["session-title"]}>{session.title}</span>
      <span className={styles["session-member"]}>With: {memberName}</span>
      <span className={styles["session-code"]}>{session.invite_code}</span>
      <button
        className={styles["session-delete-btn"]}
        onClick={() => onDelete(session.id)}
      >
        Delete
      </button>
      <button
        className={styles["session-join-btn"]}
        onClick={() => onJoin(session.invite_code)}
      >
        Enter
      </button>
    </li>
  );
};

export default SessionListItem;
