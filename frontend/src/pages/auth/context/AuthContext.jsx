import { createContext, useState, useEffect, useContext } from "react";
import {
  login as loginService,
  register as registerService,
  forgotPassword as forgotPasswordService,
  getMe as getMeService,
} from "../services/authService";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // jwt token
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));

    async function checkAuth() {
      if (storedToken) {
        try {
          const userData = await getMeService(storedToken);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function login(username, password) {
    try {
      const data = await loginService(username, password); // data: { access_token, token_type}

      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);

      const userData = await getMeService(data.access_token);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  }

  async function register(username, email, password) {
    try {
      const userData = await registerService(username, email, password);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  }

  async function forgotPassword(email) {
    try {
      const response = await forgotPasswordService(email);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  async function getMe() {
    if (!token) return null;
    try {
      const userData = await getMeService(token);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        login,
        logout,
        register,
        forgotPassword,
        getMe,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth };
