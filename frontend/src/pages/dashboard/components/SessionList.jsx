import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../shared/components/Alert";
import Loader from "../../../shared/components/Loader";
import { deleteSession } from "../services/sessionService";
import SessionListItem from "./SessionListItem";
import useAuth from "../../auth/hooks/useAuth";
import styles from "../../../styles/dashboard.module.css";

const SessionList = ({ sessions, loading, error, setSessions }) => {
  const [deleteError, setDeleteError] = useState(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (sessionId) => {
    setDeleteError(null);
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setDeleteError(err.message || "Failed to delete session");
    }
  };

  const handleJoin = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <Alert type="error" message={error.message || "Error loading sessions"} />
    );

  return (
    <div className={styles["session-list-container"]}>
      <h2 className={styles["session-list-title"]}>My Sessions</h2>
      <div className={styles["session-search-container"]}>
        <input
          type="text"
          className={styles["session-search"]}
          placeholder="Search by title..."
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
        />
        <input
          type="text"
          className={styles["session-search"]}
          placeholder="Search by member..."
          value={memberQuery}
          onChange={(e) => setMemberQuery(e.target.value)}
        />
      </div>
      {deleteError && <Alert type="error" message={deleteError} />}

      <ul className={styles["session-list"]} style={{ minHeight: "100px" }}>
        {sessions.map((session) => {
          const titleMatch = session.title
            .toLowerCase()
            .includes(titleQuery.toLowerCase());
          const memberMatch = session.members?.some((m) =>
            m.username.toLowerCase().includes(memberQuery.toLowerCase())
          );

          const titleOk = titleQuery ? titleMatch : true;
          const memberOk = memberQuery ? memberMatch : true;
          const isVisible = titleOk && memberOk;

          return (
            <SessionListItem
              key={session.id}
              session={session}
              currentUserId={user?.id}
              onDelete={handleDelete}
              onJoin={() => handleJoin(session.id)}
              className={`${styles["session-item"]} ${
                isVisible ? "" : styles.hide
              }`}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default SessionList;
