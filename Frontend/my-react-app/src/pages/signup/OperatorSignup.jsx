import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function OperatorSignup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <div className="w-full max-w-md bg-blue-800/80 backdrop-blur-xl rounded-2xl p-8 text-white shadow-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full mb-3"></div>
          <h2 className="text-2xl font-semibold">Create Operator Account</h2>
          <p className="text-sm text-blue-200">Sign up to get started</p>
        </div>

        {/* Full Name */}
        <label className="text-sm">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full mt-1 mb-4 px-4 py-2 rounded-md text-black outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Email */}
        <label className="text-sm">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mt-1 mb-4 px-4 py-2 rounded-md text-black outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Password */}
        <label className="text-sm">Password</label>
        <div className="relative mt-1 mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-full px-4 py-2 rounded-md text-black outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <label className="text-sm">Confirm Password</label>
        <div className="relative mt-1 mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full px-4 py-2 rounded-md text-black outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Sign Up Button */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 transition py-3 rounded-md font-semibold">
          Sign up
        </button>

        {/* Login Redirect */}
        <p className="text-center text-sm mt-5 text-blue-200">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login/operator")}
            className="text-white font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}

export default OperatorSignup;
