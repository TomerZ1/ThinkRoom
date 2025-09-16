import React from "react";
import CreateSessionCard from "./CreateSessionCard";
import JoinSessionCard from "./JoinSessionCard";
import styles from "../../../styles/dashboard.module.css";

const ActionBox = ({ setSessions }) => {
  return (
    <div className={styles["action-box"]}>
      <CreateSessionCard setSessions={setSessions} />
      <div className={styles.divider}>
        <span>OR</span>
      </div>
      <JoinSessionCard setSessions={setSessions} />
    </div>
  );
};

export default ActionBox;
