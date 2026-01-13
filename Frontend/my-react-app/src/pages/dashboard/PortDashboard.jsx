import Navbar from "../../components/Navbar";
import PortCard from "../../components/PortCard";
import ports from "../../data/ports";

/* ================= Helper ================= */
function calculateWaitTime(entryTime, berthingTime) {
  const entry = new Date(entryTime);
  const berth = new Date(berthingTime);

  const diffMs = berth - entry;
  const diffHours = diffMs / (1000 * 60 * 60);

  return `${diffHours.toFixed(1)} hrs`;
}

function PortDashboard() {
  return (
    <div className="w-screen min-h-screen bg-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">
            Port Congestion Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Monitor congestion, arrivals, and wait times
          </p>
        </div>

        {/* Port Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ports.map((port) => {
            // 🔹 Sample times (replace with backend later)
            const entryTime = "2026-01-03T08:00:00";
            const berthingTime = "2026-01-03T12:30:00";

            const avgWaitCalculated = calculateWaitTime(
              entryTime,
              berthingTime
            );

            return (
              <PortCard
                key={port.id}
                port={port}
                avgWaitCalculated={avgWaitCalculated}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default PortDashboard;
