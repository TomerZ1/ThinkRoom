import React from "react";
import styles from "./settings.module.css";
import SketchSettings from "./SketchSettings";
import EditorSettings from "./EditorSettings";

const SettingsPanel = () => {
  return (
    <div className={styles["settings-panel"]}>
      <h2 className={styles["panel-title"]}>Session Settings</h2>

      <div className={styles["sections"]}>
        <section className={styles["section-card"]}>
          <h3 className={styles["section-title"]}>Sketchboard</h3>
          <SketchSettings />
        </section>

        <section className={styles["section-card"]}>
          <h3 className={styles["section-title"]}>Code Editor</h3>
          <EditorSettings />
        </section>
      </div>
    </div>
  );
};

export default SettingsPanel;
