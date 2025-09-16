import React, { useState } from "react";
import styles from "../../../../styles/session.module.css";
import WorkToolbar from "./WorkToolbar";
import SketchPanel from "./SketchPanel/SketchPanel";
import CodeEditor from "./CodePanel/CodeEditor";

const WorkArea = ({ sessionId }) => {
  const [activeView, setActiveView] = useState("editor");

  return (
    <div className={styles["work-area"]}>
      <WorkToolbar activeView={activeView} setActiveView={setActiveView} />

      <div className={styles["work-content"]}>
        {activeView === "editor" && <CodeEditor sessionId={sessionId} />}
        {activeView === "board" && <SketchPanel sessionId={sessionId} />}
      </div>
    </div>
  );
};

export default WorkArea;
