import React from "react";
import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/components/TextInput";
import { createSession } from "../services/sessionService";
import styles from "../../../styles/dashboard.module.css";
import { useNavigate } from "react-router-dom";

const CreateSessionCard = ({ setSessions }) => {
  const [title, setTitle] = React.useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const newSession = await createSession(title);
      setSessions((prevSessions) => [...prevSessions, newSession]);
      setTitle("");
      navigate(`/session/${newSession.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className={styles["action-card"]}>
      <h3 className={styles["card-title"]}>Create a New Session</h3>
      <TextInput
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        label="Session Title"
        placeholder=" "
      />
      <Button onClick={handleCreate}>Create Session</Button>
    </div>
  );
};

export default CreateSessionCard;
