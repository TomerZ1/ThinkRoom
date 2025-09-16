import React from "react";
import styles from "../../../../styles/session.module.css";

const WorkToolbar = ({ activeView, setActiveView }) => {
  return (
    <div className={styles["work-toolbar"]}>
      <button
        className={`${styles["work-toolbar-button"]} ${
          activeView === "editor" ? styles["active"] : ""
        }`}
        onClick={() => setActiveView("editor")}
      >
        <i className="pi pi-pencil"></i>
      </button>
      <button
        className={`${styles["work-toolbar-button"]} ${
          activeView === "board" ? styles["active"] : ""
        }`}
        onClick={() => setActiveView("board")}
      >
        <i className="pi pi-code"></i>
      </button>
    </div>
  );
};

export default WorkToolbar;
