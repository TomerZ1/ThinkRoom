import React, { useEffect } from "react";
import styles from "./materials.module.css";
import UploadForm from "./UploadForm";
import MaterialsList from "./MaterialsList";

import useMaterials from "../../../hooks/useMaterials";

const MaterialsPanel = ({ sessionId }) => {
  const {
    materials,
    loading,
    error,
    fetchMaterials,
    deleteMaterial,
    uploadMaterial,
    downloadMaterial,
  } = useMaterials();

  useEffect(() => {
    if (!sessionId) return;
    fetchMaterials(sessionId);
  }, [sessionId]);

  const handleDelete = (materialId) => {
    deleteMaterial(materialId, sessionId);
  };

  const handleUploadSuccess = (file) => {
    uploadMaterial(file, sessionId);
  };

  const handleDownload = (materialId, filename) => {
    downloadMaterial(materialId, filename);
  };

  return (
    <div className={styles["materials-panel"]}>
      {loading && <div>Loading materials...</div>}
      {error && <div className={styles["error"]}>{error}</div>}
      <MaterialsList
        sessionId={sessionId}
        materials={materials}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
      <UploadForm sessionId={sessionId} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default MaterialsPanel;
