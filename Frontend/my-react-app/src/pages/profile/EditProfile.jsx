import { useParams, useNavigate } from "react-router-dom";

function EditProfile() {
  const { role } = useParams();
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-semibold mb-2">
          Edit {role.charAt(0).toUpperCase() + role.slice(1)} Profile
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          Update your profile information
        </p>

        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full mb-4 px-4 py-2 rounded bg-slate-700 outline-none"
          placeholder="Enter name"
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full mb-4 px-4 py-2 rounded bg-slate-700 outline-none"
          placeholder="Enter email"
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full mb-6 px-4 py-2 rounded bg-slate-700 outline-none"
          placeholder="Update password"
        />

        <div className="flex gap-4">
          <button
            className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-slate-600 py-2 rounded hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;
