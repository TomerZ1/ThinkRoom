import React, { useContext } from "react";
import styles from "../../../styles/session.module.css";
import { useNavigate } from "react-router-dom";
import SessionSocketContext from "../context/SessionSocketContext";

const Toolbar = () => {
  const sessionTitle = "My Live Session"; // placeholder, will come from props/context later
  const inviteCode = "ABC12345"; // placeholder, will come from backend later
  const navigate = useNavigate();

  const { socketRef } = useContext(SessionSocketContext);

  const handleLeave = () => {
    // Close the WebSocket connection if it exists
    if (socketRef.current) {
      socketRef.current.close();
    }
    navigate("/dashboard");
  };

  return (
    <div className={styles["session-toolbar"]}>
      {/* Left: Logo + App name */}
      <div className={styles["session-toolbar-left"]}>
        <img
          src="/logo.png"
          alt="ThinkRoom Logo"
          className={styles["toolbar-logo"]}
        />
        <span className={styles["session-toolbar-title"]}>ThinkRoom</span>
      </div>

      {/* Center: Session title */}
      <div className={styles["session-toolbar-center"]}>
        <span className={styles["session-toolbar-session-title"]}>
          {sessionTitle}
        </span>
      </div>

      {/* Right: Invite code + Leave button */}
      <div className={styles["session-toolbar-right"]}>
        <span className={styles["session-invite-code"]}>
          {inviteCode}
          <i className="pi pi-copy"></i>
        </span>
        <button className={styles["session-leave-btn"]} onClick={handleLeave}>
          <i className="pi pi-sign-out"></i>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
