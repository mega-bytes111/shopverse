import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);

  // loader sirf tab jab auth decide nahi hua + not authenticated
  if (loading && !isAuthenticated) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;