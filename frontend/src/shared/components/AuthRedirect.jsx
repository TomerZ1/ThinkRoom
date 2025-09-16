import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../pages/auth/hooks/useAuth";

const AuthRedirect = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRedirect;
