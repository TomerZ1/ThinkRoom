import React from "react";
import styles from "./settings.module.css";
import { useSettings } from "../../../context/SettingsContext";

const SketchSettings = () => {
  const { settings, setSketch } = useSettings();
  const { bgColor, showGrid, gridSize } = settings.sketch;

  return (
    <form className={styles["form"]} onSubmit={(e) => e.preventDefault()}>
      {/* Background */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="sketch-bg">
          Background
        </label>
        <input
          id="sketch-bg"
          type="color"
          className={styles["color-input"]}
          value={bgColor}
          onChange={(e) => setSketch({ bgColor: e.target.value })}
          aria-label="Sketch background color"
        />
      </div>

      {/* Grid */}
      <div className={styles["form-row"]}>
        <span className={styles["label"]}>Show grid</span>
        <label className={styles["toggle"]}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setSketch({ showGrid: e.target.checked })}
          />
          <span className={styles["toggle-slider"]} />
        </label>
      </div>

      {/* Grid size */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="sketch-grid">
          Grid size
        </label>
        <div className={styles["range-wrap"]}>
          <input
            id="sketch-grid"
            type="range"
            min="4"
            max="64"
            value={gridSize}
            onChange={(e) => setSketch({ gridSize: Number(e.target.value) })}
            className={styles["range"]}
          />
          <span className={styles["range-value"]}>{gridSize}px</span>
        </div>
      </div>
    </form>
  );
};

export default SketchSettings;
