function SystemHealth() {
  const systems = [
    { name: "Server Uptime", value: "99.9%" },
    { name: "Database Status", value: "Operational" },
    { name: "API Latency", value: "120 ms" },
    { name: "Security Alerts", value: "0 Active" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">System Health</h3>

      <div className="space-y-3">
        {systems.map((s, i) => (
          <div
            key={i}
            className="flex justify-between text-sm border-b pb-2 last:border-none"
          >
            <span>{s.name}</span>
            <span className="font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealth;
