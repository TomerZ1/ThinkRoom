import React from "react";
import styles from "./settings.module.css";
import { useSettings } from "../../../context/SettingsContext";

const EditorSettings = () => {
  const { settings, setEditor } = useSettings();
  const { theme, language, fontSize, wordWrap, minimap } = settings.editor;

  return (
    <form className={styles["form"]} onSubmit={(e) => e.preventDefault()}>
      {/* Theme */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="editor-theme">
          Theme
        </label>
        <select
          id="editor-theme"
          className={styles["select"]}
          value={theme}
          onChange={(e) => setEditor({ theme: e.target.value })}
        >
          <option value="vs-dark">Dark</option>
          <option value="vs">Light</option>
          <option value="hc-black">High Contrast</option>
        </select>
      </div>

      {/* Language */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="editor-language">
          Language
        </label>
        <select
          id="editor-language"
          className={styles["select"]}
          value={language}
          onChange={(e) => setEditor({ language: e.target.value })}
        >
          {[
            "javascript",
            "typescript",
            "python",
            "json",
            "markdown",
            "html",
            "css",
            "java",
            "cpp",
          ].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="editor-fontsize">
          Font size
        </label>
        <div className={styles["range-wrap"]}>
          <input
            id="editor-fontsize"
            className={styles["range"]}
            type="range"
            min="10"
            max="22"
            value={fontSize}
            onChange={(e) => setEditor({ fontSize: Number(e.target.value) })}
          />
          <span className={styles["range-value"]}>{fontSize}px</span>
        </div>
      </div>

      {/* Word wrap */}
      <div className={styles["form-row"]}>
        <label className={styles["label"]} htmlFor="editor-wrap">
          Word wrap
        </label>
        <select
          id="editor-wrap"
          className={styles["select"]}
          value={wordWrap}
          onChange={(e) => setEditor({ wordWrap: e.target.value })}
        >
          {["off", "on", "bounded", "wordWrapColumn"].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      {/* Minimap */}
      <div className={styles["form-row"]}>
        <span className={styles["label"]}>Minimap</span>
        <label className={styles["toggle"]}>
          <input
            type="checkbox"
            checked={minimap}
            onChange={(e) => setEditor({ minimap: e.target.checked })}
          />
          <span className={styles["toggle-slider"]} />
        </label>
      </div>
    </form>
  );
};

export default EditorSettings;
