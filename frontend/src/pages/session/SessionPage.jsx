import React, { useEffect, useRef } from "react";
import styles from "../../styles/session.module.css";
import { useParams } from "react-router-dom";

import Toolbar from "./components/Toolbar";
import WorkArea from "./components/WorkArea/WorkArea";
import SideArea from "./components/SideArea/SideArea";

import { SessionSocketProvider } from "./context/SessionSocketContext";
import { SettingsProvider } from "./context/SettingsContext";
import { VideoProvider, useVideoCtx } from "./context/VideoContext";

function GlobalAudioSink() {
  const { remoteStream } = useVideoCtx();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = remoteStream || null;

    // Attempt autoplay; may be blocked until a user gesture
    audioRef.current.play?.().catch(() => {});
  }, [remoteStream]);

  return <audio ref={audioRef} autoPlay style={{ display: "none" }} />;
}

const SessionPage = () => {
  const { sessionId } = useParams();

  return (
    <SessionSocketProvider sessionId={sessionId}>
      <SettingsProvider sessionId={sessionId}>
        {/* Mount the WebRTC logic once for the whole session */}
        <VideoProvider sessionId={sessionId}>
          <div className={styles["session-page"]}>
            {/* Top toolbar */}
            <Toolbar className={styles["session-toolbar"]} />

            {/* Main layout */}
            <main className={styles["session-main"]}>
              {/* Left: work area (sketch/code/etc) */}
              <WorkArea sessionId={sessionId} />

              {/* Right: side panel (chat/materials/video/settings) */}
              <aside className={styles["side-area"]}>
                <SideArea sessionId={sessionId} />
              </aside>
            </main>

            {/* Keeps remote audio flowing outside the Video tab */}
            <GlobalAudioSink />
          </div>
        </VideoProvider>
      </SettingsProvider>
    </SessionSocketProvider>
  );
};

export default SessionPage;
