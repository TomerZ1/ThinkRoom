import shared from "../../styles/shared.module.css";

const Alert = ({ type = "error", message }) => {
  if (!message) return null;

  const alertTypeClass =
    type === "error" ? shared["alert-error"] : shared["alert-success"];

  return <div className={`${shared.alert} ${alertTypeClass}`}>{message}</div>;
};

export default Alert;
