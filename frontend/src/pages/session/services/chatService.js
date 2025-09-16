import apiClient from "../../../shared/utils/apiClient";

export const sendMessage = async (content, sessionId) => {
  try {
    const response = await apiClient.post("/messages/create", {
      content,
      session_id: sessionId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to send message");
  }
};

export const fetchMessages = async (sessionId) => {
  try {
    const response = await apiClient.get(`/sessions/${sessionId}/messages`);
    return response.data; // array of messages
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to fetch messages");
  }
};
