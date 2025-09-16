import apiClient from "../../../shared/utils/apiClient";

export async function getMine() {
  try {
    const response = await apiClient.get("/sessions/mine");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function createSession(title) {
  try {
    const response = await apiClient.post("/sessions/create", { title });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function joinSession(invite_code) {
  try {
    const response = await apiClient.post("/sessions/join", { invite_code });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function deleteSession(id) {
  try {
    const response = await apiClient.delete(`/sessions/${id}`);
    return response.data || { success: true };
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
