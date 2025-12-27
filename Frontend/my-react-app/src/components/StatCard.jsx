function StatCard({ title, value, change, subtitle }) {
  const positive = change >= 0;

  return (
    <div
      className="bg-white border rounded-2xl p-6
                 flex justify-between items-start
                 shadow-sm transition
                 hover:shadow-md hover:-translate-y-0.5
                 focus-within:ring-2 focus-within:ring-blue-400"
      aria-label={`${title} statistic`}
    >
      {/* Left content */}
      <div>
        <p className="text-sm text-gray-500 mb-1">
          {title}
        </p>

        <h2 className="text-3xl font-semibold text-gray-800">
          {value}
        </h2>

        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Change indicator */}
      <div
        className={`flex items-center gap-1 text-sm font-semibold
                    px-2.5 py-1 rounded-full
                    ${
                      positive
                        ? "text-green-700 bg-green-100"
                        : "text-red-700 bg-red-100"
                    }`}
      >
        <span>
          {positive ? "▲" : "▼"}
        </span>
        <span>
          {positive ? `+${change}` : change}
        </span>
      </div>
    </div>
  );
}

export default StatCard;
