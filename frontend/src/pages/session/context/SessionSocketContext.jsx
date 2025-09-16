import { createContext } from "react";
import useSessionSocket from "../hooks/useSessionSocket";

const SessionSocketContext = createContext(null);

export const SessionSocketProvider = ({ sessionId, children }) => {
  const { socketRef, sendEvent, connected } = useSessionSocket(sessionId);
  return (
    <SessionSocketContext.Provider value={{ socketRef, sendEvent, connected }}>
      {children}
    </SessionSocketContext.Provider>
  );
};

export default SessionSocketContext;
