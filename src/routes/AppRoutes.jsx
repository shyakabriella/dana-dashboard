import { Route, Routes } from "react-router-dom";
import Layouts from "../components/Layouts";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import HomepageManager from "../pages/home/HomepageManager";
import RoomManager from "../pages/room/RoomManager";
import ExperiencesManager from "../pages/experiences/ExperiencesManager";
import AboutManager from "../pages/about/AboutManager";
import FooterManager from "../pages/FooterManager";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/admin" element={<Layouts />}>
        <Route index element={<Dashboard />} />
        <Route path="home" element={<HomepageManager />} />
        <Route path="room" element={<RoomManager />} />
        <Route path="experiences" element={<ExperiencesManager />} />
        <Route path="about" element={<AboutManager />} />
        <Route path="footer" element={<FooterManager />} />
      </Route>
    </Routes>
  );
}