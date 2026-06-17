import { Route, Routes, Navigate } from "react-router-dom";
import Layouts from "../components/Layouts";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import HomepageManager from "../pages/home/HomepageManager";
import RoomManager from "../pages/room/RoomManager";
import ExperiencesManager from "../pages/experiences/ExperiencesManager";
import AboutManager from "../pages/about/AboutManager";
import FooterManager from "../pages/FooterManager";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route - Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layouts />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="home" element={<HomepageManager />} />
        <Route path="room" element={<RoomManager />} />
        <Route path="experiences" element={<ExperiencesManager />} />
        <Route path="about" element={<AboutManager />} />
        <Route path="footer" element={<FooterManager />} />
      </Route>
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}