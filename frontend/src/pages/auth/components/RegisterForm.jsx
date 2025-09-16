import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import Loader from "../../../shared/components/Loader";
import auth from "../../../styles/auth.module.css";
import shared from "../../../styles/shared.module.css";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(username, email, password);
      navigate("/login"); // Redirect to login after successful registration
    } catch (error) {
      setError(error.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={shared["form-container"]}>
      <TextInput
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder=""
      />

      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder=""
      />

      <TextInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder=""
      />

      <Button type="submit" disabled={loading}>
        {loading ? <Loader /> : "Register"}
      </Button>

      {error && <Alert type="error" message={error} />}

      <div className={auth["auth-link-container"]}>
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </form>
  );
};

export default RegisterForm;
