function AlertsPanel({ alerts }) {
  if (!alerts.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
        <p className="text-sm text-gray-500">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-lg border-l-4 ${
              a.level === "high"
                ? "border-red-500 bg-red-50"
                : a.level === "medium"
                ? "border-yellow-500 bg-yellow-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex justify-between mb-1">
              <p className="font-medium">{a.vessel}</p>
              <span className="text-xs text-gray-500">{a.time}</span>
            </div>

            <p className="text-sm text-gray-700">
              <strong>{a.type}:</strong> {a.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;
