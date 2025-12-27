import { useNavigate } from "react-router-dom";
import RoleTabs from "../../components/RoleTabs";

function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="w-full max-w-md bg-blue-800/80 rounded-2xl p-8 text-white">

        <h2 className="text-center text-2xl font-semibold mb-2">
          Admin Login
        </h2>
        <p className="text-center text-blue-200 mb-6">
          Select Role
        </p>

        <RoleTabs />

        <label>Email</label>
        <input
          className="w-full mt-1 mb-4 px-4 py-2 rounded-md text-black"
        />

        <label>Password</label>
        <input
          type="password"
          className="w-full mt-1 mb-4 px-4 py-2 rounded-md text-black"
        />

        {/* ✅ Redirects to Admin Dashboard */}
        <button
          onClick={() => navigate("/dashboard/admin")}
          className="w-full bg-blue-500 py-3 rounded-md font-semibold"
        >
          Sign in
        </button>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup/admin")}
            className="font-semibold cursor-pointer"
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
