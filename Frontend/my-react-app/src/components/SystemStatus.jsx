function SystemStatus() {
  const systems = [
    { name: "GPS Systems", uptime: "99.8%" },
    { name: "Communication", uptime: "99.5%" },
    { name: "Radar Systems", uptime: "98.2%" },
    { name: "Data Processing", uptime: "99.9%" },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">System Status</h3>

      <div className="space-y-4">
        {systems.map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b border-slate-700 pb-3 last:border-none"
          >
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-green-400">Operational</p>
            </div>
            <span className="text-sm">{s.uptime}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemStatus;
