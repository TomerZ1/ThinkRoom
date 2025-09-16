import shared from "../../styles/shared.module.css";

const TextInput = ({ label, type = "text", value, onChange, placeholder }) => {
  const id = label ? label.replace(/\s+/g, "-").toLowerCase() : undefined;

  return (
    <div className={shared["smart-field"]}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

export default TextInput;
