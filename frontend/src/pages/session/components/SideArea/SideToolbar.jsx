import React from "react";
import styles from "../../../../styles/session.module.css";

const SideToolbar = ({ activeView, setActiveView }) => {
  return (
    <div className={styles["side-toolbar"]}>
      <button
        className={`${styles["side-toolbar-button"]} ${activeView === "chat" ? styles["active"] : ""}`}
        onClick={() => setActiveView("chat")}
        aria-label="Chat"
        title="Chat"
      >
        <i className="pi pi-comments"></i>
      </button>

      <button
        className={`${styles["side-toolbar-button"]} ${activeView === "materials" ? styles["active"] : ""}`}
        onClick={() => setActiveView("materials")}
        aria-label="Materials"
        title="Materials"
      >
        <i className="pi pi-file"></i>
      </button>

      <button
        className={`${styles["side-toolbar-button"]} ${activeView === "video" ? styles["active"] : ""}`}
        onClick={() => setActiveView("video")}
        aria-label="Video"
        title="Video"
      >
        <i className="pi pi-video"></i>
      </button>

      <button
        className={`${styles["side-toolbar-button"]} ${activeView === "settings" ? styles["active"] : ""}`}
        onClick={() => setActiveView("settings")}
        aria-label="Settings"
        title="Settings"
      >
        <i className="pi pi-cog"></i>
      </button>
    </div>
  );
};

export default SideToolbar;
