import React from "react";
import MaterialsItem from "./MaterialsItem";
import styles from "./materials.module.css";

const MaterialsList = ({ sessionId, materials, onDelete, onDownload }) => {
  return (
    <div className={styles["materials-list"]}>
      {materials.length === 0 ? (
        <p className={styles["no-materials"]}>No materials uploaded yet.</p>
      ) : (
        materials.map((material) => (
          <MaterialsItem
            key={material.id}
            sessionId={sessionId}
            material={material}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))
      )}
    </div>
  );
};

export default MaterialsList;
