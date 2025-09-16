import React, { useState, useContext } from "react";
import SketchToolbar from "./SketchToolbar";
import SketchCanvas from "./SketchCanvas";
import styles from "./sketch.module.css";
import SessionSocketContext from "../../../context/SessionSocketContext";

const SketchPanel = ({ sessionId }) => {
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState("draw"); // "draw" | "erase"

  const { sendEvent } = useContext(SessionSocketContext);

  const handleClear = () => {
    sendEvent("sketch_clear", {}); // server clears memory+DB and broadcasts 'sketch_cleared'
  };

  return (
    <div className={styles["sketch-panel"]}>
      <SketchToolbar
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        setMode={setMode}
        onClear={handleClear}
        mode={mode}
      />
      <SketchCanvas
        sessionId={sessionId}
        color={color}
        lineWidth={lineWidth}
        mode={mode}
      />
    </div>
  );
};

export default SketchPanel;
