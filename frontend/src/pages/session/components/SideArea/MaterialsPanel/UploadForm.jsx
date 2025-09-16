import React, { useState } from "react";
import styles from "./materials.module.css";

const UploadForm = ({ sessionId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    try {
      setUploadStatus("Uploading...");
      await onUploadSuccess(file, sessionId);
      setUploadStatus("Upload successful!");
    } catch (error) {
      setUploadStatus(`Upload failed: ${error}`);
    }
  };

  return (
    <div className={styles["upload-form"]}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="button" onClick={handleUpload}>
        <i className="pi pi-upload"></i>
      </button>
      {uploadStatus && (
        <p
          className={`${styles["upload-status"]} ${
            uploadStatus.includes("successful")
              ? styles.success
              : uploadStatus.includes("failed")
                ? styles.error
                : ""
          }`}
        >
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default UploadForm;
