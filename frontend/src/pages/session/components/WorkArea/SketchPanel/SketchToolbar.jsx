import React from "react";
import styles from "./sketch.module.css";

const SketchToolbar = ({
  color,
  setColor,
  lineWidth,
  setLineWidth,
  setMode,
  onClear,
  mode,
}) => {
  return (
    <div className={styles["sketch-toolbar"]}>
      {/* Color picker */}
      <div
        className={styles["toolbar-section"]}
        role="group"
        aria-label="Pen color"
      >
        <input
          type="color"
          className={styles["color-input"]}
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setMode("draw");
          }}
          onClick={() => setMode("draw")}
          aria-label="Select pen color"
          title={`Pen color: ${color}`}
        />
      </div>

      {/* Eraser */}
      <button
        type="button"
        className={`${styles["eraser-btn"]} ${mode === "erase" ? styles["active"] : ""}`}
        onClick={() => setMode("erase")}
        aria-label="Eraser"
        title="Eraser"
      >
        <i className="pi pi-eraser"></i>
      </button>

      {/* Line width */}
      <label className={styles["width-label"]}>
        Width
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          aria-label="Line width"
        />
      </label>

      {/* Clear */}
      <button
        type="button"
        className={styles["clear-btn"]}
        onClick={onClear}
        aria-label="Clear board for everyone"
        title="Clear board for everyone"
      >
        <i className="pi pi-trash"></i>
      </button>
    </div>
  );
};

export default SketchToolbar;
