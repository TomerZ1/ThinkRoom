import apiClient from "../../../shared/utils/apiClient";

/*
POST /auth/token
Content-Type: application/x-www-form-urlencoded
Body: { username, password, grant_type, ... }
*/
export async function login(username, password) {
  try {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const response = await apiClient.post("/auth/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data; // { access_token, token_type, expires_in, ... }
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

/*
POST /auth/register
Content-Type: application/json
Body: { "email": string, "username": string, "password": string }
*/
export async function register(username, email, password) {
  try {
    const response = await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });

    return response.data; // { id, username, email, is_active, created_at, ... }
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

/*
POST /auth/forgot-password
Content-Type: application/json
Body: { "email": string }
*/
export async function forgotPassword(email) {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getMe(token) {
  try {
    const response = await apiClient.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { id, username, email, is_active, created_at, ... }
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
