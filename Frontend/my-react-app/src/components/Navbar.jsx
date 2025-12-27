import { useNavigate } from "react-router-dom";

function Navbar({ role = "Operator", onLogout }) {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate(`/profile/edit/${role.toLowerCase()}`);
  };

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          Marine Traffic Control
        </h1>
        <p className="text-sm text-gray-400">Dashboard Overview</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="bg-slate-700 px-3 py-1 rounded-full text-sm text-white">
          {role}
        </span>

        {/* Edit Profile */}
        <button
          onClick={handleEditProfile}
          className="text-sm text-blue-400 hover:underline"
        >
          Edit Profile
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-sm text-red-400 hover:text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
