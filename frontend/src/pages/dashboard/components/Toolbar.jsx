import React from "react";
import useAuth from "../../auth/hooks/useAuth";
import Avatar from "../../../shared/components/Avatar";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/dashboard.module.css";

const Toolbar = ({ activeView, setActiveView }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.toolbar}>
      {/* Left: logo and app name */}
      <div className={styles["toolbar-left"]}>
        <img
          src="/logo.png"
          alt="ThinkRoom Logo"
          className={styles["toolbar-logo"]}
        />
        <span className={styles["toolbar-title"]}>ThinkRoom</span>
      </div>

      {/* Center: navigation buttons */}
      <div className={styles["toolbar-center"]}>
        <button
          className={`${styles["nav-btn"]} ${activeView === "home" ? styles.active : ""}`}
          onClick={() => setActiveView("home")}
        >
          Home
        </button>
        <button
          className={`${styles["nav-btn"]} ${activeView === "sessions" ? styles.active : ""}`}
          onClick={() => setActiveView("sessions")}
        >
          Sessions
        </button>
      </div>

      {/* Right: user profile icon */}
      <div className={styles["toolbar-right"]}>
        <button className={styles["logout-btn"]} onClick={handleLogout}>
          Logout
        </button>
        <Avatar name={user?.username || "U"} />
      </div>
    </div>
  );
};

export default Toolbar;
