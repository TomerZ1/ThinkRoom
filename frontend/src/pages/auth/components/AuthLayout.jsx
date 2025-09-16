import React from "react";
import styles from "../../../styles/auth.module.css";
import shared from "../../../styles/shared.module.css";

const AuthLayout = ({ children }) => {
  return (
    <div className={styles["auth-layout"]}>
      <div className={styles["auth-card"]}>
        <div className={shared["orbit-container"]}>
          <div className={shared["orbit-logo"]}>
            <img
              src="/logo.png"
              alt="ThinkRoom Logo"
              className={shared["orbit-img"]}
            />
          </div>
        </div>
        <h1 className={styles["auth-title"]}>ThinkRoom</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
