import apiClient from "../../../shared/utils/apiClient";

export const uploadMaterial = async (sessionId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post(
      `/materials/upload?session_id=${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMaterials = async (sessionId) => {
  try {
    const response = await apiClient.get(`/materials/${sessionId}`);
    return response.data; // array of materials
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const downloadMaterial = async (materialId, filename) => {
  try {
    const response = await apiClient.get(`/materials/${materialId}/download`, {
      responseType: "blob",
    });

    // Guess MIME type from filename extension
    const extension = filename.split(".").pop().toLowerCase();
    let mimeType = "application/octet-stream";

    if (extension === "png") mimeType = "image/png";
    else if (["jpg", "jpeg"].includes(extension)) mimeType = "image/jpeg";
    else if (extension === "pdf") mimeType = "application/pdf";

    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    await apiClient.delete(`/materials/${materialId}`);
    return true;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
