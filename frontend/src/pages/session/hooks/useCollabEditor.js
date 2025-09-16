import { useEffect, useRef, useContext } from "react";
import SessionSocketContext from "../context/SessionSocketContext";
import { useAuth } from "../../auth/context/AuthContext";

const useCollabEditor = (sessionId) => {
  const { socketRef, sendEvent, connected } = useContext(SessionSocketContext);
  const { token } = useAuth();

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const modelRef = useRef(null);

  const isApplyingRemoteEdit = useRef(false);

  const userIdRef = useRef(null);
  useEffect(() => {
    // Decode user ID from JWT token
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userIdRef.current = parseInt(payload.sub, 10);
      }
    } catch {
      userIdRef.current = null;
    }
  }, [token]);

  // handle incoming messages from WebSocket
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !connected) return;

    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "editor_sync") {
          if (!modelRef.current) return;
          isApplyingRemoteEdit.current = true;
          modelRef.current.setValue(
            typeof msg.content === "string" ? msg.content : ""
          );
          isApplyingRemoteEdit.current = false;
        }

        if (msg.type === "editor_cleared") {
          if (!modelRef.current) return;
          isApplyingRemoteEdit.current = true;
          modelRef.current.setValue("");
          isApplyingRemoteEdit.current = false;
        }

        if (msg.type === "editor_set") {
          if (!modelRef.current) return;
          isApplyingRemoteEdit.current = true;
          modelRef.current.setValue(
            typeof msg.content === "string" ? msg.content : ""
          );
          isApplyingRemoteEdit.current = false;
        }

        if (msg.type === "editor_update") {
          const { user, content } = msg;
          // Ignore our own echoes; Monaco already applied our local change
          if (
            user &&
            userIdRef.current &&
            Number(user.id) === Number(userIdRef.current)
          ) {
            return;
          }
          if (!modelRef.current || !content) return;

          const { offset = 0, length = 0, text = "" } = content;

          // convert to monaco range
          const startPos = modelRef.current.getPositionAt(Math.max(0, offset));
          const endPos = modelRef.current.getPositionAt(
            Math.max(0, offset + Math.max(0, length))
          );

          isApplyingRemoteEdit.current = true;
          modelRef.current.applyEdits([
            {
              range: {
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
              },
              text: text || "",
              forceMoveMarkers: true,
            },
          ]);
          isApplyingRemoteEdit.current = false;
          return;
        }
      } catch (e) {
        console.error("❌ Failed to parse WS message:", e);
      }
    };

    socket.addEventListener("message", handleMessage); // handshake
    sendEvent("editor_get", {});
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socketRef, connected, sendEvent]);

  // called by Monaco on mount
  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    modelRef.current = editor.getModel();

    // send deltas for each local change
    editor.onDidChangeModelContent((e) => {
      if (isApplyingRemoteEdit.current) return; // skip if this change originated remotely

      for (const change of e.changes) {
        // keep order (taking care of batched changes)
        const delta = {
          offset: change.rangeOffset,
          length: change.rangeLength,
          text: change.text,
        };
        sendEvent("editor_update", { content: delta });
      }
    });
  };

  return {
    onMount: handleMount,
  };
};

export default useCollabEditor;
