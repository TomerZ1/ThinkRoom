import React from "react";
import styles from "./materials.module.css";

const MaterialsItem = ({ sessionId, material, onDelete, onDownload }) => {
  const handleDownload = async () => {
    try {
      await onDownload(material.id, material.filename);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = () => {
    onDelete(material.id);
  };

  return (
    <div className={styles["materials-item"]}>
      <div className={styles["materials-info"]}>
        <span className={styles["materials-filename"]}>
          {material.filename}
        </span>
        <span className={styles["materials-uploader"]}>
          Uploaded by: {material.user_id}
        </span>
      </div>
      <button
        onClick={handleDownload}
        className={styles["materials-download-btn"]}
      >
        <i className="pi pi-download"></i>
      </button>
      <button onClick={handleDelete} className={styles["materials-delete-btn"]}>
        <i className="pi pi-trash"></i>
      </button>
    </div>
  );
};

export default MaterialsItem;
