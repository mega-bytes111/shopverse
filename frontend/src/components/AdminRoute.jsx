import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((s) => s.auth);

  if (loading && !isAuthenticated) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;