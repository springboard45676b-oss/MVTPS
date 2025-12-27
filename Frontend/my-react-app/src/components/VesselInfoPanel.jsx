function VesselInfoPanel({ vessel }) {
  if (!vessel) return null;

  const [lat, lng] = vessel.position;

  return (
    <div className="w-full bg-white border-t px-6 py-4 flex justify-between items-center">

      {/* Left Info */}
      <div>
        <h3 className="text-lg font-semibold">{vessel.name}</h3>
        <p className="text-sm text-gray-600">
          Category: {vessel.category}
        </p>
        <p className="text-sm text-gray-600">
          Flag: {vessel.flag}
        </p>
      </div>

      {/* Right Info */}
      <div className="text-right text-sm text-gray-700">
        <p>
          <strong>Position:</strong>{" "}
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>

    </div>
  );
}

export default VesselInfoPanel;
