import React, { useState, useEffect } from "react";
import useDashboard from "./hooks/useDashboard";
import { getMine } from "./services/sessionService";
import Toolbar from "./components/Toolbar";
import WelcomeBox from "./components/WelcomeBox";
import ActionBox from "./components/ActionBox";
import SessionList from "./components/SessionList";
import styles from "../../styles/dashboard.module.css";

const DashboardPage = () => {
  const { activeView, setActiveView } = useDashboard();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMine()
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error fetching sessions");
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.dashboard}>
      <Toolbar activeView={activeView} setActiveView={setActiveView} />

      <div className={styles["dashboard-content"]}>
        <div className={styles["tab-content"]}>
          <div
            className={`${styles["tab-panel"]} ${
              activeView === "home" ? styles.active : ""
            }`}
          >
            <WelcomeBox />
            <ActionBox setSessions={setSessions} />
          </div>

          <div
            className={`${styles["tab-panel"]} ${
              activeView === "sessions" ? styles.active : ""
            }`}
          >
            <SessionList
              sessions={sessions}
              loading={loading}
              error={error}
              setSessions={setSessions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
