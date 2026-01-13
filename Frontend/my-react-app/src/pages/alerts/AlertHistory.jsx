import { useAlerts } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";

function AlertHistory() {
  const { alerts, markAsRead } = useAlerts();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Alert History</h2>

        <div className="flex gap-4">
          {/* 🔙 BACK TO DASHBOARD */}
          <button
            onClick={() => navigate("/dashboard/operator")}
            className="text-sm text-green-400 hover:underline"
          >
            ← Back to Dashboard
          </button>

          {/* 🔙 BACK */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-400 hover:underline"
          >
            Back
          </button>
        </div>
      </div>

      {/* ================= ALERT LIST ================= */}
      {alerts.length === 0 ? (
        <p className="text-gray-400">No alerts available</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              onClick={() => markAsRead(alert.id)}
              className={`p-4 rounded-xl cursor-pointer border transition
                ${
                  alert.read
                    ? "bg-slate-800 border-slate-700 opacity-80"
                    : "bg-red-900/30 border-red-600"
                }`}
            >
              <p className="font-medium">{alert.message}</p>

              <p className="text-xs text-gray-400 mt-1">
                {alert.type} • {alert.time}
              </p>

              {!alert.read && (
                <span className="inline-block mt-2 text-xs text-red-400">
                  ● Unread
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertHistory;
