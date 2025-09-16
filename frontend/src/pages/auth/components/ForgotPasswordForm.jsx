import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import TextInput from "../../../shared/components/TextInput";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import Loader from "../../../shared/components/Loader";
import auth from "../../../styles/auth.module.css";
import shared from "../../../styles/shared.module.css";

const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth(); // get only forgotPassword from context
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setSuccess("If this email is registered, you will receive a reset link");
    } catch (error) {
      setError("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={shared["form-container"]}>
      <TextInput
        label="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder=""
      />

      <Button type="submit" disabled={loading}>
        {loading ? <Loader /> : "Send Reset Link"}
      </Button>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className={auth["auth-link-container"]}>
        <span>Remembered your password? </span>
        <Link to="/login">Login here</Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
