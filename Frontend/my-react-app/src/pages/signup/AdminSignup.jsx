import { useNavigate } from "react-router-dom";

function AdminSignup() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="w-full max-w-md bg-blue-800/80 rounded-2xl p-8 text-white shadow-xl">

        <h2 className="text-center text-2xl font-semibold mb-6">
          Admin Signup
        </h2>

        <input
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 rounded-md text-black"
        />
        <input
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-md text-black"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 rounded-md text-black"
        />

        <button className="w-full bg-blue-500 py-3 rounded-md font-semibold">
          Sign up
        </button>

        <p
          onClick={() => navigate("/login/admin")}
          className="text-center text-sm mt-4 cursor-pointer"
        >
          Already have an account? Sign in
        </p>

      </div>
    </div>
  );
}

export default AdminSignup;
