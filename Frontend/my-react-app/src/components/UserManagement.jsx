function UserManagement() {
  const users = [
    { name: "Operator 1", role: "Operator", status: "Active" },
    { name: "Analyst 1", role: "Analyst", status: "Active" },
    { name: "Operator 2", role: "Operator", status: "Inactive" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">User Management</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2">Role</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{u.name}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    u.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
