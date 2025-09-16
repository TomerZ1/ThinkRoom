import React, { createContext, useContext } from "react";
import useVideo from "../hooks/useVideo";

const VideoContext = createContext(null);

export const VideoProvider = ({ sessionId, children }) => {
  const value = useVideo(sessionId); // mount the hook once at session scope
  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

export const useVideoCtx = () => {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideoCtx must be used within <VideoProvider>");
  return ctx;
};
