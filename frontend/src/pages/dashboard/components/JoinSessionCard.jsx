import React, { useState } from "react";
import Alert from "../../../shared/components/Alert";
import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/components/TextInput";
import { joinSession } from "../services/sessionService";
import styles from "../../../styles/dashboard.module.css";

const JoinSessionCard = ({ setSessions }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    try {
      const joinedSession = await joinSession(inviteCode);
      setSessions((prevSessions) => [...prevSessions, joinedSession]);
      setInviteCode("");
      setError(null);
    } catch (error) {
      setError(error.message || "Error joining session");
    }
  };

  return (
    <div className={styles["action-card"]}>
      <h3 className={styles["card-title"]}>Join an Existing Session</h3>
      <TextInput
        type="text"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        label="Invite Code"
        placeholder=" "
      />
      <Button onClick={handleJoin}>Join Session</Button>
      {error && <Alert type="error" message={error} />}
    </div>
  );
};

export default JoinSessionCard;
