import { useNavigate } from "react-router-dom"; 
import { useAlerts } from "../context/AlertContext"; // ✅ alerts context

function Navbar({ role = "Operator", onLogout }) {
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const unreadCount = alerts.filter(a => !a.read).length;

  const handleEditProfile = () => {
    navigate(`/profile/edit/${role.toLowerCase()}`);
  };

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      
      {/* ================= LEFT ================= */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          Marine Traffic Control
        </h1>
        <p className="text-sm text-gray-400">Dashboard Overview</p>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-5">

        {/* 🔔 ALERT BELL */}
        <button
          onClick={() => navigate("/alerts")}
          className="relative text-white hover:text-red-400 transition"
          title="Alerts"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* ROLE BADGE */}
        <span className="bg-slate-700 px-3 py-1 rounded-full text-sm text-white">
          {role}
        </span>

        {/* EDIT PROFILE */}
        <button
          onClick={handleEditProfile}
          className="text-sm text-blue-400 hover:underline"
        >
          Edit Profile
        </button>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="text-sm text-red-400 hover:text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
