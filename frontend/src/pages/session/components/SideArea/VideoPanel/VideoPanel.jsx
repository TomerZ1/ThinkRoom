import React, { useEffect, useRef } from "react";
import { useVideoCtx } from "../../../context/VideoContext";
import styles from "./video.module.css";

const VideoPanel = () => {
  const {
    localStream,
    remoteStream,
    micEnabled,
    camEnabled,
    pcState,
    error,
    toggleMic,
    toggleCam,
    hangUp,
  } = useVideoCtx();

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream || null;
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  return (
    <div className={styles["video-panel"]}>
      <div className={styles["video-stage"]}>
        <video
          ref={remoteRef}
          className={styles["remote-video"]}
          autoPlay
          playsInline
        />
        <video
          ref={localRef}
          className={styles["local-video"]}
          autoPlay
          muted
          playsInline
        />
      </div>

      <div className={styles["controls"]}>
        <button
          className={`${styles["btn"]} ${micEnabled ? styles["on"] : styles["off"]}`}
          onClick={toggleMic}
          type="button"
          title={micEnabled ? "Mute" : "Unmute"}
        >
          {micEnabled ? "Mute" : "Unmute"}
        </button>
        <button
          className={`${styles["btn"]} ${camEnabled ? styles["on"] : styles["off"]}`}
          onClick={toggleCam}
          type="button"
          title={camEnabled ? "Stop Cam" : "Start Cam"}
        >
          {camEnabled ? "Stop Cam" : "Start Cam"}
        </button>
        <button className={styles["btn-danger"]} onClick={hangUp} type="button">
          Hang up
        </button>
        <span className={styles["status"]}>ICE: {pcState}</span>
        {error && <span className={styles["error"]}>{error}</span>}
      </div>
    </div>
  );
};

export default VideoPanel;
