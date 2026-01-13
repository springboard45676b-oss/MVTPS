import { useParams, useNavigate } from "react-router-dom";

function EditProfile() {
  const { role } = useParams();
  const navigate = useNavigate();

  const roleTitle =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">

      {/* Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">

        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-1">
          Edit {roleTitle} Profile
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          Update your profile information
        </p>

        {/* Name */}
        <label className="block text-sm text-gray-300 mb-1">
          Name
        </label>
        <input
          type="text"
          placeholder="Enter name"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-gray-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Email */}
        <label className="block text-sm text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter email"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-gray-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password */}
        <label className="block text-sm text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Update password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-gray-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Actions */}
        <div className="flex gap-4">
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Save Changes
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-medium hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;
