import { useAlerts } from "../../context/AlertContext";

function ComplianceReport() {
  const { alertHistory } = useAlerts();

  const violations = alertHistory.filter(
    a => a.type === "ZONE_VIOLATION"
  );

  return (
    <div className="p-6 bg-slate-900 text-white">
      <h2 className="text-xl font-semibold mb-4">
        Compliance Violation Report
      </h2>

      {violations.map((v, i) => (
        <div key={i} className="bg-slate-800 p-4 rounded mb-3">
          <p><b>Vessel:</b> {v.vessel}</p>
          <p><b>Zone:</b> {v.message}</p>
          <p><b>Time:</b> {v.time}</p>
        </div>
      ))}
    </div>
  );
}
