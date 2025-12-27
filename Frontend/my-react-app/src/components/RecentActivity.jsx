function RecentActivity() {
  const activities = [
    {
      name: "Atlantic Voyager",
      message: "Departed from New York Port",
      time: "5 min ago",
    },
    {
      name: "Pacific Queen",
      message: "Speed reduced to 8 knots",
      time: "12 min ago",
    },
    {
      name: "Nordic Star",
      message: "Arrived at London Port",
      time: "23 min ago",
    },
    {
      name: "Mediterranean Express",
      message: "Course changed to 135°",
      time: "45 min ago",
    },
    {
      name: "Caribbean Spirit",
      message: "Communication check completed",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex justify-between items-start border-b border-slate-700 pb-3 last:border-none"
          >
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-sm text-slate-300">{a.message}</p>
            </div>
            <span className="text-xs text-slate-400">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
