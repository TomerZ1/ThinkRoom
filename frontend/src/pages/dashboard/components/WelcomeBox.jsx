import React from "react";
import useAuth from "../../auth/hooks/useAuth";
import styles from "../../../styles/dashboard.module.css";

const WelcomeBox = () => {
  const { user } = useAuth();
  const username = user?.username || "Guest";

  return (
    <div className={styles["welcome-box"]}>
      <h2 className={styles["welcome-title"]}>Welcome Back, {username}!</h2>
      <p className={styles["welcome-subtitle"]}>
        Create a new session or join an existing one.
      </p>
    </div>
  );
};

export default WelcomeBox;
