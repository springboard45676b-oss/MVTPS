import { useState } from "react";
import { useAlerts } from "../context/AlertContext";
import AlertPanel from "./AlertPanel";

function AlertBell() {
  const { alerts } = useAlerts();
  const [open, setOpen] = useState(false);

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && <AlertPanel />}
    </div>
  );
}

export default AlertBell;
