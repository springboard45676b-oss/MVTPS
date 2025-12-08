import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import DarkModeToggle from "./DarkModeToggle";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/vessels", label: "Vessels" },
  { to: "/ports", label: "Ports" },
  { to: "/voyages", label: "Voyages" },
  { to: "/events", label: "Events" },
  { to: "/notifications", label: "Notifications" },
  { to: "/live-tracking", label: "Live Tracking" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center font-bold shadow">
            VT
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Vessel Tracking</h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive || location.pathname === item.to
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <DarkModeToggle className="flex-shrink-0" />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-100"
            >
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white grid place-items-center font-semibold">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-500">Signed in</p>
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
                  {user?.username || "User"}
                </p>
              </div>
              <svg
                className={`h-4 w-4 text-slate-500 transition ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-2 text-sm">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="font-semibold text-slate-900 truncate">{user?.email || user?.username || "User"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3 flex flex-wrap gap-2 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-3 py-2 transition ${
                isActive || location.pathname === item.to
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-200/70 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-500">
      <span> {new Date().getFullYear()} Vessel Tracking</span>
      <span className="text-slate-400">Secure Maritime Operations</span>
    </div>
  </footer>
);

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;