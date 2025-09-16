import { useState } from "react";
import {
  getMaterials,
  uploadMaterial as uploadMaterialApi,
  deleteMaterial as deleteMaterialApi,
  downloadMaterial as downloadMaterialApi,
} from "../services/materialsService";

const useMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterials(sessionId);
      setMaterials(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const uploadMaterial = async (file, sessionId) => {
    setLoading(true);
    setError(null);
    try {
      await uploadMaterialApi(sessionId, file);
      await fetchMaterials(sessionId);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id, sessionId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMaterialApi(id);
      await fetchMaterials(sessionId);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadMaterial = async (id, filename) => {
    setLoading(true);
    setError(null);
    try {
      await downloadMaterialApi(id, filename);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    uploadMaterial,
    deleteMaterial,
    downloadMaterial,
  };
};

export default useMaterials;
