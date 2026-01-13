import { useAlerts } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";

function AlertPanel() {
  const { alerts, markAsRead } = useAlerts();
  const navigate = useNavigate();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl p-4 z-[1000]">
      <h3 className="font-semibold mb-2">Notifications</h3>

      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {alerts.slice(0, 5).map((a) => (
          <li
            key={a.id}
            onClick={() => markAsRead(a.id)}
            className={`cursor-pointer text-sm p-2 rounded ${
              a.read ? "bg-gray-100" : "bg-red-50"
            }`}
          >
            <strong>{a.severity}</strong> — {a.message}
            <div className="text-xs text-gray-500">{a.time}</div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate("/alerts")}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        View all alerts
      </button>
    </div>
  );
}

export default AlertPanel;
