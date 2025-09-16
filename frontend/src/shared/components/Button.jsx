import shared from "../../styles/shared.module.css";

const Button = ({ children, onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      className={shared["btn-neural"]}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
