import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { setUser } = useAuth();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const checkTokenExpiration = () => {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.exp * 1000 < Date.now();
  };

  useEffect(() => {
    if (checkTokenExpiration()) {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token, setUser]);

  if (checkTokenExpiration()) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
