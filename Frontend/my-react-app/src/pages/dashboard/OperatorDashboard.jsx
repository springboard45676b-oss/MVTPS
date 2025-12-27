import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function OperatorDashboard() {
  const navigate = useNavigate();

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    navigate("/login/operator");
  };

  return (
    <div className="w-screen min-h-screen bg-slate-900 text-white">
      {/* ✅ PASS LOGOUT HANDLER */}
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* ================= TOP STAT CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Vessels</p>
              <h2 className="text-3xl font-semibold mt-1">156</h2>
            </div>
            <span className="text-green-400 text-sm">+12</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-400">Vessels in Port</p>
              <h2 className="text-3xl font-semibold mt-1">42</h2>
            </div>
            <span className="text-red-400 text-sm">-3</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Warnings</p>
              <h2 className="text-3xl font-semibold mt-1">8</h2>
            </div>
            <span className="text-green-400 text-sm">+2</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Traffic</p>
              <h2 className="text-3xl font-semibold mt-1">198</h2>
            </div>
            <span className="text-green-400 text-sm">+9</span>
          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Live Tracking */}
            <div
              onClick={() => navigate("/dashboard/operator/live-tracking")}
              className="cursor-pointer bg-blue-600 rounded-2xl p-6 hover:opacity-90 transition"
            >
              <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
              <p className="text-sm opacity-90">
                View real-time vessel positions
              </p>
              <span className="text-2xl mt-4 block">→</span>
            </div>

            {/* Traffic Analytics */}
            <div className="bg-purple-600 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Traffic Analytics
              </h3>
              <p className="text-sm opacity-90">
                View traffic patterns and reports
              </p>
              <span className="text-2xl mt-4 block">→</span>
            </div>

            {/* Communication */}
            <div className="bg-green-600 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Communication
              </h3>
              <p className="text-sm opacity-90">
                Send messages to vessels
              </p>
              <span className="text-2xl mt-4 block">→</span>
            </div>

            {/* Weather Monitor */}
            <div className="bg-cyan-600 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Weather Monitor
              </h3>
              <p className="text-sm opacity-90">
                Check weather conditions
              </p>
              <span className="text-2xl mt-4 block">→</span>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM PANELS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>

            <ul className="space-y-4 text-sm">
              <li className="border-b border-slate-700 pb-3">
                <strong>Atlantic Voyager</strong>
                <p className="text-gray-400">
                  Departed from New York Port
                </p>
                <span className="text-xs text-gray-500">5 min ago</span>
              </li>
              <li className="border-b border-slate-700 pb-3">
                <strong>Pacific Queen</strong>
                <p className="text-gray-400">
                  Speed reduced to 8 knots
                </p>
                <span className="text-xs text-gray-500">12 min ago</span>
              </li>
              <li className="border-b border-slate-700 pb-3">
                <strong>Nordic Star</strong>
                <p className="text-gray-400">
                  Arrived at London Port
                </p>
                <span className="text-xs text-gray-500">23 min ago</span>
              </li>
              <li className="border-b border-slate-700 pb-3">
                <strong>Mediterranean Express</strong>
                <p className="text-gray-400">
                  Course changed to 135°
                </p>
                <span className="text-xs text-gray-500">45 min ago</span>
              </li>
              <li>
                <strong>Caribbean Spirit</strong>
                <p className="text-gray-400">
                  Communication check completed
                </p>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">System Status</h3>

            <div className="space-y-5 text-sm">
              <div className="flex justify-between">
                <div>
                  <p>GPS Systems</p>
                  <p className="text-green-400">Operational</p>
                </div>
                <p>99.8%</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Communication</p>
                  <p className="text-green-400">Operational</p>
                </div>
                <p>99.5%</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Radar Systems</p>
                  <p className="text-green-400">Operational</p>
                </div>
                <p>98.2%</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Data Processing</p>
                  <p className="text-green-400">Operational</p>
                </div>
                <p>99.9%</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default OperatorDashboard;
