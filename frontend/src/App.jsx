import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AuthRedirect from "./shared/components/AuthRedirect";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SessionPage from "./pages/session/SessionPage";

import { AuthProvider } from "./pages/auth/context/AuthContext";
import routes from "./shared/constants/routes";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={routes.register}
            element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            }
          />
          <Route
            path={routes.forgotPassword}
            element={
              <AuthRedirect>
                <ForgotPasswordPage />
              </AuthRedirect>
            }
          />
          <Route
            path={routes.login}
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          {/* All other routes require login */}
          <Route
            path="/session/:sessionId"
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
