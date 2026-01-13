import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);           // 🔔 Active alerts
  const [alertHistory, setAlertHistory] = useState([]); // 📜 Full history

  /* ================= ADD ALERT ================= */
  const addAlert = (alert) => {
    setAlerts((prev) => {
      // ❌ Prevent duplicate active alerts
      const exists = prev.some(
        (a) => a.message === alert.message
      );
      if (exists) return prev;

      const newAlert = {
        id: Date.now() + Math.random(), // ✅ unique ID
        message: alert.message,
        type: alert.type || "General",
        read: false,
        time: new Date().toLocaleTimeString(),
      };

      // ✅ Add to history (always)
      setAlertHistory((history) => [newAlert, ...history]);

      // ✅ Add to active alerts
      return [newAlert, ...prev];
    });
  };

  /* ================= MARK AS READ ================= */
  const markAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, read: true } : a
      )
    );
  };

  /* ================= CLEAR ACTIVE ALERTS ================= */
  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,         // 🔔 used by bell icon
        alertHistory,   // 📜 used by AlertHistory page
        addAlert,
        markAsRead,
        clearAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);
