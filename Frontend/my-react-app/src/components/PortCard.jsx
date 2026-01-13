import CongestionBadge from "./CongestionBadge";

function PortCard({ port, avgWaitCalculated }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 space-y-4 hover:shadow-lg transition">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{port.name}</h3>
          <p className="text-sm text-gray-400">{port.country}</p>
        </div>

        <CongestionBadge level={port.congestion} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Arrivals</p>
          <p className="font-semibold">{port.arrivals}</p>
        </div>

        <div>
          <p className="text-gray-400">Departures</p>
          <p className="font-semibold">{port.departures}</p>
        </div>

        <div>
          <p className="text-gray-400">Avg Wait</p>
          <p className="font-semibold">
            {avgWaitCalculated || port.avgWait}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortCard;
