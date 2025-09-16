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

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.detail || "Invalid username or password");
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
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder=""
      />

      <Button type="submit" disabled={loading}>
        {loading ? <Loader /> : "Login"}
      </Button>

      {error && <Alert type="error" message={error} />}

      <div className={auth["auth-link-container"]}>
        <span>Forgot your password? </span>
        <Link to="/forgot-password">Click here</Link>
      </div>
      <div className={auth["auth-link-container"]}>
        <span>First time? </span>
        <Link to="/register">Register here</Link>
      </div>
    </form>
  );
};

export default LoginForm;
