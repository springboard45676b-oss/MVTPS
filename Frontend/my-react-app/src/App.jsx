import { Routes, Route, Navigate } from "react-router-dom";

/* ================= Login Pages ================= */
import OperatorLogin from "./pages/login/OperatorLogin";
import AnalystLogin from "./pages/login/AnalystLogin";
import AdminLogin from "./pages/login/AdminLogin";

/* ================= Signup Pages ================= */
import OperatorSignup from "./pages/signup/OperatorSignup";
import AnalystSignup from "./pages/signup/AnalystSignup";
import AdminSignup from "./pages/signup/AdminSignup";

/* ================= Dashboard Pages ================= */
import OperatorDashboard from "./pages/dashboard/OperatorDashboard";
import LiveTracking from "./pages/dashboard/LiveTracking";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PortDashboard from "./pages/dashboard/PortDashboard";

/* ================= Profile Pages ================= */
import EditProfile from "./pages/profile/EditProfile";

/* ================= Alerts ================= */
import AlertHistory from "./pages/alerts/AlertHistory";

/* ================= Voyage ================= */
import VoyageHistory from "./pages/voyage/VoyageHistory"; // ✅ ADD THIS

function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login/operator" replace />} />

      {/* Login */}
      <Route path="/login/operator" element={<OperatorLogin />} />
      <Route path="/login/analyst" element={<AnalystLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      {/* Signup */}
      <Route path="/signup/operator" element={<OperatorSignup />} />
      <Route path="/signup/analyst" element={<AnalystSignup />} />
      <Route path="/signup/admin" element={<AdminSignup />} />

      {/* Operator */}
      <Route path="/dashboard/operator" element={<OperatorDashboard />} />
      <Route path="/dashboard/operator/live-tracking" element={<LiveTracking />} />
      <Route path="/dashboard/operator/ports" element={<PortDashboard />} />

      {/* Admin */}
      <Route path="/dashboard/admin" element={<AdminDashboard />} />

      {/* Profile */}
      <Route path="/profile/edit/:role" element={<EditProfile />} />

      {/* Alerts */}
      <Route path="/alerts" element={<AlertHistory />} />

      {/* ✅ Voyage History */}
      <Route path="/voyage-history" element={<VoyageHistory />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login/operator" replace />} />
    </Routes>
  );
}

export default App;
