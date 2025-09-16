import React from "react";

/**
 * Avatar component
 * @param {Object} props
 * @param {string} props.name - Full name of the user
 * @param {string} [props.imageUrl] - Optional image URL
 * @param {number} [props.size=40] - Size in pixels
 */
const Avatar = ({ name, imageUrl, size = 40 }) => {
  // Compute initials from the name
  let initials = "";
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      initials = parts[0][0];
    } else if (parts.length > 1) {
      initials = parts[0][0] + parts[parts.length - 1][0];
    }
    initials = initials.toUpperCase();
  }

  const style = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#eee",
    fontSize: size * 0.4,
    fontWeight: "bold",
    color: "#555",
    userSelect: "none",
  };

  return (
    <div className="avatar" style={style}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="avatar-img"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
