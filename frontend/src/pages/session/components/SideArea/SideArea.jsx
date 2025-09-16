// SideArea.jsx
import React, { useState } from "react";
import styles from "../../../../styles/session.module.css";
import SideToolbar from "./SideToolbar";
import ChatPanel from "./ChatPanel/ChatPanel";
import MaterialsPanel from "./MaterialsPanel/MaterialsPanel";
import SettingsPanel from "./SettingsPanel/SettingsPanel";
import VideoPanel from "./VideoPanel/VideoPanel";

const SideArea = ({ sessionId }) => {
  const [activeView, setActiveView] = useState("chat");

  return (
    <div className={styles["side-area"]}>
      <SideToolbar activeView={activeView} setActiveView={setActiveView} />
      <div className={styles["side-content"]}>
        {activeView === "chat" && <ChatPanel sessionId={sessionId} />}
        {activeView === "materials" && <MaterialsPanel sessionId={sessionId} />}
        {activeView === "video" && <VideoPanel />}
        {activeView === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
};

export default SideArea;
