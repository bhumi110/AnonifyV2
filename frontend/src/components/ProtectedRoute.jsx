import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0d',
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '0.9rem',
        gap: '10px',
      }}>
        <span style={{
          width: 18, height: 18,
          border: '2px solid rgba(168,85,247,0.2)',
          borderTopColor: '#A855F7',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
        Loading…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — redirect to login, preserving intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}