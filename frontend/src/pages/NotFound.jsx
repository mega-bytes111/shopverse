import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>404 - Page Not Found</h2>
      <p style={{ marginTop: 6 }}>
        <Link to="/">Go Home</Link>
      </p>
    </div>
  );
};

export default NotFound;