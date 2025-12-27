import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import AdminActionCard from "../../components/AdminActionCard";
import UserManagement from "../../components/UserManagement";
import SystemHealth from "../../components/SystemHealth";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              System Control & Monitoring
            </p>
          </div>

          <button
            onClick={() => navigate("/login/admin")}
            className="text-sm text-blue-600 hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Users" value="128" change={8} />
          <StatCard title="Active Operators" value="42" change={3} />
          <StatCard title="Active Analysts" value="19" change={2} />
          <StatCard title="System Alerts" value="2" change={-1} />
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminActionCard
            title="User Management"
            description="Add, edit, remove users"
            color="bg-blue-600"
          />
          <AdminActionCard
            title="Access Control"
            description="Manage roles & permissions"
            color="bg-purple-600"
          />
          <AdminActionCard
            title="System Logs"
            description="View system activity logs"
            color="bg-green-600"
          />
          <AdminActionCard
            title="Security Settings"
            description="Configure security rules"
            color="bg-red-600"
          />
        </div>

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserManagement />
          <SystemHealth />
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
