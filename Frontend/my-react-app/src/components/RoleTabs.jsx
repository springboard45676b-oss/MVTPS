import { useNavigate, useLocation } from "react-router-dom";
import {
  MdHeadsetMic,
  MdAnalytics,
  MdAdminPanelSettings,
} from "react-icons/md";

function RoleTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const roles = [
    {
      name: "Operator",
      path: "/login/operator",
      icon: MdHeadsetMic,
    },
    {
      name: "Analyst",
      path: "/login/analyst",
      icon: MdAnalytics,
    },
    {
      name: "Admin",
      path: "/login/admin",
      icon: MdAdminPanelSettings,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {roles.map((r) => {
        const active = location.pathname === r.path;
        const Icon = r.icon;

        return (
          <button
            key={r.name}
            onClick={() => navigate(r.path)}
            className={`flex flex-col items-center gap-1 py-4 rounded-xl text-sm font-semibold transition
              ${
                active
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }
            `}
          >
            <Icon size={22} className={active ? "text-white" : "text-blue-600"} />
            {r.name}
          </button>
        );
      })}
    </div>
  );
}

export default RoleTabs;
